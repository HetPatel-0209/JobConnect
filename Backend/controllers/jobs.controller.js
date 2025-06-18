const JobPost = require('../models/JobPost');
const User = require('../models/User');
const Resume = require('../models/Resume');
const Application = require('../models/Application');
const { parseResumeFromBuffer, calculateAIATSScore, calculateBasicATSScore, compressPDF, generateRandomFilename } = require('../utils/aiResumeParser');
const cloudinary = require('cloudinary');
const fs = require('fs').promises;
const path = require('path');

// Get all job posts with optional filtering
exports.getAllJobs = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            location, 
            skills, 
            jobType, 
            workMode, 
            salaryMin, 
            salaryMax,
            search 
        } = req.query;

        // Build query object
        const query = { status: 'active' };
        
        // Add filters if provided
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
          if (skills) {
            const skillsArray = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
            // Use case-insensitive regex for each skill
            query['requirements.skills.required'] = { 
                $in: skillsArray.map(skill => new RegExp(skill, 'i'))
            };
        }
        
        if (jobType) {
            query.jobType = jobType;
        }
        
        if (workMode) {
            query.workMode = workMode;
        }
          if (salaryMin || salaryMax) {
            query.$and = query.$and || [];
            
            if (salaryMin) {
                // Job max salary should be >= requested min salary
                query.$and.push({ 'salary.max': { $gte: Number(salaryMin) } });
            }
            
            if (salaryMax) {
                // Job min salary should be <= requested max salary  
                query.$and.push({ 'salary.min': { $lte: Number(salaryMax) } });
            }
        }
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        
        const jobs = await JobPost.find(query)
            .populate('recruiter', 'name email')
            .populate('organization', 'name logo location')
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit));

        const total = await JobPost.countDocuments(query);

        res.json({
            jobs,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalJobs: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a specific job by ID
exports.getJobById = async (req, res) => {
    try {
        const { jobId } = req.params;
        
        // Validate ObjectId format
        if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid job ID format' });
        }

        const job = await JobPost.findById(jobId)
            .populate('recruiter', 'name email')
            .populate('organization', 'name logo location contact description');

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json({ job });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get applied jobs
exports.getAppliedJobs = async (req, res) => {
    try {
        const applications = await Application.find({ applicant: req.user._id })
            .populate({
                path: 'job',
                populate: {
                    path: 'organization',
                    select: 'name logo'
                }
            })
            .sort('-appliedAt');
        
        res.json({
            applications,
            total: applications.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Calculate ATS score with AI
exports.calculateATSScore = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { useAI = true } = req.query;
        
        const job = await JobPost.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const user = await User.findById(req.user._id);
        
        // Get user's active resume
        const resume = await Resume.findOne({ 
            user: req.user._id, 
            isActive: true 
        });

        let resumeData = {
            skills: user.skills || [],
            education: user.education || [],
            experience: user.experience || []
        };

        // If resume exists and has parsed data, use that
        if (resume && resume.parsedData) {
            resumeData = {
                ...resumeData,
                ...resume.parsedData
            };
        }

        const jobData = {
            title: job.title,
            description: job.description,
            skills: job.skills,
            requirements: job.requirements,
            location: job.location,
            experienceLevel: job.experienceLevel
        };

        let result;
        
        if (useAI && process.env.GROQ_API_KEY) {
            try {
                result = await calculateAIATSScore(resumeData, jobData);
            } catch (aiError) {
                console.warn('AI ATS calculation failed, falling back to basic:', aiError.message);
                result = calculateBasicATSScore(resumeData, jobData);
            }
        } else {
            result = calculateBasicATSScore(resumeData, jobData);
        }

        res.json({
            ...result,
            jobId: jobId,
            hasResume: !!resume
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Post a job (recruiter)
exports.postJob = async (req, res) => {
    try {
        const job = new JobPost({
            ...req.body,
            recruiter: req.user._id
        });
        const savedJob = await job.save();
        
        // Add job to recruiter's postedJobs
        await User.findByIdAndUpdate(req.user._id, {
            $push: { postedJobs: savedJob._id }
        });

        res.status(201).json(savedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get applied candidates (recruiter)
exports.getAppliedCandidates = async (req, res) => {
    try {
        const { jobId } = req.params;
        
        // Validate ObjectId format
        if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid job ID format' });
        }
        
        // Verify job exists and belongs to recruiter
        const job = await JobPost.findOne({
            _id: jobId,
            recruiter: req.user._id
        });
        
        if (!job) {
            return res.status(404).json({ message: 'Job not found or not authorized' });
        }

        const applications = await Application.find({ job: jobId })
            .populate('applicant', 'name email phone location profilePic')
            .populate('job', 'title')
            .sort('-appliedAt');

        res.json({
            job: {
                id: job._id,
                title: job.title,
                organization: job.organization
            },
            applications,
            total: applications.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Apply for a job
exports.applyForJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user._id;

        // Validate ObjectId format
        if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid job ID format' });
        }

        const job = await JobPost.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.status !== 'active') {
            return res.status(400).json({ message: 'Job is no longer active' });
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            job: jobId,
            applicant: userId
        });
        
        if (existingApplication) {
            return res.status(400).json({ message: 'Already applied to this job' });
        }

        // Get user's active resume for ATS calculation
        const resume = await Resume.findOne({ 
            user: userId, 
            isActive: true 
        });

        let atsScore = 0;
        let aiEvaluation = null;

        if (resume && resume.parsedData) {
            // Calculate ATS score
            const jobData = {
                title: job.title,
                description: job.description,
                skills: job.requirements?.skills?.required || [],
                requirements: job.requirements,
                location: job.location
            };

            try {
                const result = await calculateAIATSScore(resume.parsedData, jobData);
                atsScore = result.atsScore;
                aiEvaluation = {
                    score: result.atsScore,
                    matchedSkills: result.matchedSkills || [],
                    missingSkills: result.missingSkills || [],
                    suggestions: result.suggestions || []
                };
            } catch (aiError) {
                // Fallback to basic scoring
                const basicResult = calculateBasicATSScore(resume.parsedData, jobData);
                atsScore = basicResult.atsScore;
                aiEvaluation = {
                    score: basicResult.atsScore,
                    matchedSkills: basicResult.matchedSkills || [],
                    missingSkills: basicResult.missingSkills || []
                };
            }
        }

        // Create application
        const application = new Application({
            job: jobId,
            applicant: userId,
            atsScore,
            aiEvaluation
        });

        await application.save();

        res.status(201).json({ 
            message: 'Successfully applied to job',
            application: {
                id: application._id,
                atsScore: application.atsScore,
                appliedAt: application.appliedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update job status
exports.updateJobStatus = async (req, res) => {
    try {
        const { jobId } = req.params;
        const updates = req.body;
        const job = await JobPost.findOne({
            _id: jobId,
            recruiter: req.user._id
        });

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        Object.keys(updates).forEach(key => {
            job[key] = updates[key];
        });
        
        await job.save();
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete job
exports.deleteJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await JobPost.findOne({
            _id: jobId,
            recruiter: req.user._id
        });

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Remove job reference from recruiter's posted jobs
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { postedJobs: jobId }
        });

        // Remove job reference from all jobseekers who applied
        await User.updateMany(
            { appliedJobs: jobId },
            { $pull: { appliedJobs: jobId } }
        );        await JobPost.findByIdAndDelete(jobId);
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search jobs
// Upload and parse resume
exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No resume file uploaded' });
        }

        const userId = req.user._id;
        
        // Deactivate existing resumes
        await Resume.updateMany(
            { user: userId },
            { isActive: false }
        );

        const fileExt = path.extname(req.file.originalname).toLowerCase();
        const isDocx = fileExt === '.docx' || fileExt === '.doc';
        const isPdf = fileExt === '.pdf';
        
        if (!isPdf && !isDocx) {
            return res.status(400).json({ 
                message: 'Unsupported file type. Only PDF and DOCX files are allowed.' 
            });
        }
        
        // Variables for compression (only applies to PDF)
        let compressedBuffer, originalSize, compressedSize, compressionRatio;
        
        if (isPdf) {
            // Get compression level from query params (default to medium)
            const compressionLevel = req.query.compression || 'medium';
            
            // Validate compression level
            if (!['low', 'medium', 'high', 'none'].includes(compressionLevel)) {
                console.warn(`Invalid compression level: ${compressionLevel}, using 'medium' instead`);
            }
            
            // If compression is set to 'none', skip compression
            if (compressionLevel === 'none') {
                compressedBuffer = req.file.buffer;
                originalSize = compressedSize = req.file.buffer.length;
                compressionRatio = 0;
            } else {
                // Compress the PDF before uploading
                ({ buffer: compressedBuffer, originalSize, compressedSize, compressionRatio } = 
                  await compressPDF(req.file.buffer, compressionLevel));
            }
        } else {
            // For DOCX, just use the original buffer
            compressedBuffer = req.file.buffer;
            originalSize = compressedSize = req.file.buffer.length;
            compressionRatio = 0;
        }
        
        // Parse resume data
        let parsedData = null;
        try {
            parsedData = await parseResumeFromBuffer(compressedBuffer, req.file.mimetype);
        } catch (extractError) {
            console.error('Resume extraction failed:', extractError);
            return res.status(400).json({ message: 'Failed to parse resume: ' + extractError.message });
        }

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const randomFilename = generateRandomFilename();
            const resourceFormat = fileExt.replace('.', ''); // Remove the dot from extension
            
            cloudinary.v2.uploader.upload_stream(
                {
                    resource_type: 'raw', // This is crucial for document files
                    folder: 'resumes',
                    public_id: `${isPdf ? 'pdf' : 'docx'}_${Date.now()}_${randomFilename}`,
                    use_filename: false,
                    unique_filename: false,
                    format: resourceFormat
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            ).end(compressedBuffer);
        });

        // Generate document URLs with proper resource type
        const fileUrl = cloudinary.v2.url(result.public_id, {
            resource_type: 'raw',
            secure: true,
            sign_url: false,
        });

        // Generate download URL with proper headers
        const downloadUrl = cloudinary.v2.url(result.public_id, {
            resource_type: 'raw',
            secure: true,
            sign_url: false,
            flags: 'attachment'
        });

        // Create new resume record
        const resume = new Resume({
            user: userId,
            filename: req.file.originalname,
            fileUrl: fileUrl,
            cloudinaryPublicId: result.public_id,
            cloudinaryUrl: result.url,
            cloudinarySecureUrl: result.secure_url,
            downloadUrl: downloadUrl,
            fileSize: compressedSize,
            originalSize: originalSize,
            mimeType: req.file.mimetype,
            parsedText: parsedData.rawText,
            parsedData: {
                skills: parsedData.skills,
                education: parsedData.education,
                experience: parsedData.experience
            },
            isActive: true
        });

        await resume.save();

        // Update user profile with extracted data
        const user = await User.findById(userId);
        if (parsedData.skills.length > 0) {
            // Merge with existing skills, avoid duplicates
            const existingSkills = user.skills || [];
            const newSkills = [...new Set([...existingSkills, ...parsedData.skills])];
            user.skills = newSkills;
        }
        if (parsedData.education.length > 0 && (!user.education || user.education.length === 0)) {
            user.education = parsedData.education;
        }
        if (parsedData.experience.length > 0 && (!user.experience || user.experience.length === 0)) {
            user.experience = parsedData.experience;
        }
        await user.save();        res.status(201).json({
            message: 'Resume uploaded and parsed successfully',
            resume: {
                id: resume._id,
                filename: resume.filename,
                fileUrl: resume.fileUrl,
                cloudinaryUrl: resume.cloudinaryUrl,
                downloadUrl: resume.downloadUrl,
                fileSize: resume.fileSize,
                originalSize: resume.originalSize,
                compressedSize: resume.compressedSize,
                compressionRatio: resume.compressionRatio,
                mimeType: resume.mimeType,
                uploadedAt: resume.uploadedAt,
                parsedData: resume.parsedData
            }
        });
    } catch (error) {
        console.error('Resume upload error:', error);
        res.status(500).json({ message: 'Failed to upload resume: ' + error.message });
    }
};

// Get user's resumes
exports.getUserResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({ user: req.user._id })
            .select('-parsedText -__v')
            .sort('-uploadedAt');
        
        res.json(resumes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete resume
exports.deleteResume = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const resume = await Resume.findOne({
            _id: resumeId,
            user: req.user._id
        });

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // Delete file from Cloudinary
        if (resume.cloudinaryPublicId) {
            try {
                await new Promise((resolve, reject) => {
                    cloudinary.v2.uploader.destroy(
                        resume.cloudinaryPublicId,
                        { resource_type: 'raw' },
                        (error, result) => {
                            if (error) {
                                console.warn('Could not delete resume from Cloudinary:', error);
                                resolve(); // Continue even if Cloudinary delete fails
                            } else {
                                resolve(result);
                            }
                        }
                    );
                });
            } catch (cloudinaryError) {
                console.warn('Error during Cloudinary file deletion:', cloudinaryError.message);
            }
        }

        await resume.deleteOne();
        res.json({ message: 'Resume deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Set active resume
exports.setActiveResume = async (req, res) => {
    try {
        const { resumeId } = req.params;
        
        // Deactivate all resumes for the user
        await Resume.updateMany(
            { user: req.user._id },
            { isActive: false }
        );

        // Activate the selected resume
        const resume = await Resume.findOneAndUpdate(
            { _id: resumeId, user: req.user._id },
            { isActive: true },
            { new: true }
        );

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.json({ message: 'Resume set as active', resume });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// View resume
exports.viewResume = async (req, res) => {
    try {
        const { resumeId } = req.params;
        
        const resume = await Resume.findById(resumeId);
        
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        
        // Check if user has access to this resume
        const isOwner = resume.user.toString() === req.user._id.toString();
        const isRecruiter = req.user.role === 'recruiter';
        
        if (!isOwner && !isRecruiter) {
            return res.status(403).json({ message: 'You do not have permission to view this resume' });
        }
        
        // For PDFs, redirect to the Cloudinary URL
        if (resume.mimeType === 'application/pdf') {
            return res.redirect(resume.cloudinaryUrl);
        }
        
        // For DOCX files, provide download URL
        return res.redirect(resume.downloadUrl);
    } catch (error) {
        console.error('Error viewing resume:', error);
        return res.status(500).json({ message: 'Error viewing resume' });
    }
};