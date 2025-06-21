const mongoose = require('mongoose');
const JobPost = require('../models/JobPost');
const User = require('../models/User');
const JobSeekerProfile = require('../models/JobSeeker');
const Recruiter = require('../models/Recruiter');
const Application = require('../models/Application');
const Resume = require('../models/Resume');
const Organization = require('../models/Organizations');
const SavedJob = require('../models/SavedJob');
const { Chat, Message } = require('../models/Chat');
const { parseResumeFromBuffer, calculateAIATSScore, calculateBasicATSScore, compressPDF, generateRandomFilename } = require('../utils/aiResumeParser');
const { sendInterviewEmail, sendHiredEmail } = require('../utils/emailService');
const cloudinary = require('cloudinary');
const fs = require('fs').promises;
const path = require('path');

// Helper function to escape special characters in regex
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// Helper function to delete user resumes from both database and Cloudinary
const deleteUserResumes = async (userId) => {
    try {
        // Find all existing resumes for the user
        const existingResumes = await Resume.find({ user: userId });
        
        // Delete files from Cloudinary first
        for (const resume of existingResumes) {
            if (resume.cloudinaryPublicId) {
                try {
                    await new Promise((resolve, reject) => {
                        cloudinary.v2.uploader.destroy(
                            resume.cloudinaryPublicId,
                            { resource_type: 'raw' },
                            (error, result) => {
                                if (error) {
                                    console.warn(`Could not delete resume ${resume.cloudinaryPublicId} from Cloudinary:`, error);
                                    resolve(); // Continue even if Cloudinary delete fails
                                } else {
                                    console.log(`Successfully deleted resume ${resume.cloudinaryPublicId} from Cloudinary`);
                                    resolve(result);
                                }
                            }
                        );
                    });
                } catch (cloudinaryError) {
                    console.warn('Error during Cloudinary file deletion:', cloudinaryError.message);
                }
            }
        }
        
        // Delete all existing resume records from database
        const deleteResult = await Resume.deleteMany({ user: userId });
        console.log(`Deleted ${deleteResult.deletedCount} resume records for user ${userId}`);        
        return { deletedCount: deleteResult.deletedCount, cloudinaryFilesDeleted: existingResumes.length };
    } catch (error) {
        console.error('Error in deleteUserResumes:', error);
        throw error;
    }
};

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
            query.location = { $regex: escapeRegExp(location), $options: 'i' };
        }
          if (skills) {
            const skillsArray = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
            // Use case-insensitive regex for each skill
            query['requirements.skills.required'] = { 
                $in: skillsArray.map(skill => new RegExp(escapeRegExp(skill), 'i'))
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
                { title: { $regex: escapeRegExp(search), $options: 'i' } },
                { description: { $regex: escapeRegExp(search), $options: 'i' } }
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

        // If user is authenticated and is a recruiter, include application count
        let jobWithApplicationCount = job.toObject();
        if (req.user && req.user.role === 'recruiter') {
            const applicationCount = await Application.countDocuments({ job: jobId });
            jobWithApplicationCount.applicationCount = applicationCount;
        }

        res.json({ job: jobWithApplicationCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get applied jobs
exports.getAppliedJobs = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        // Build query
        const query = { applicant: req.user._id };
        if (status) {
            query.status = status;
        }
        
        const skip = (page - 1) * limit;
        
        const applications = await Application.find(query)
            .populate({
                path: 'job',
                populate: {
                    path: 'organization',
                    select: 'name logo'
                }
            })
            .sort('-appliedAt')
            .skip(skip)
            .limit(Number(limit));

        const total = await Application.countDocuments(query);
        
        res.json({
            applications,
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

// Calculate ATS score with AI
exports.calculateATSScore = async (req, res) => {
    try {
        let jobId, resumeId, useAI = true;
        
        // Handle both GET and POST requests with different parameter structures
        if (req.method === 'GET') {
            // Handle GET request from params
            jobId = req.params.jobId;
            useAI = req.query.useAI !== 'false';
        } else {
            // Handle POST request from body
            jobId = req.body.jobId;
            resumeId = req.body.resumeId;
            useAI = req.body.useAI !== false;
        }
        
        if (!jobId) {
            return res.status(400).json({ message: 'Job ID is required' });
        }
        
        const job = await JobPost.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const user = await User.findById(req.user._id);
        
        // Get user's resume - either by ID from request or active resume
        let resume;
        if (resumeId) {
            resume = await Resume.findOne({ 
                _id: resumeId,
                user: req.user._id
            });
        } else {
            resume = await Resume.findOne({ 
                user: req.user._id, 
                isActive: true 
            });
        }
        
        if (!resume) {
            return res.status(404).json({ message: 'No resume found. Please upload a resume first.' });
        }

        let resumeData = {
            skills: user.skills || [],
            education: user.education || [],
            experience: user.experience || []
        };

        // If resume exists and has parsed data, use that
        if (resume.parsedData) {
            resumeData = {
                ...resumeData,
                ...resume.parsedData
            };
        }

        const jobData = {
            title: job.title,
            description: job.description,
            requirements: job.requirements,
            location: job.location
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
            atsScore: result.atsScore,
            analysis: result.analysis,
            aiEvaluation: {
                score: result.atsScore,
                matchedSkills: result.matchedSkills || [],
                missingSkills: result.missingSkills || [],
                suggestions: result.suggestions || []
            },
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
        console.log('POST /jobs request received');
        console.log('User:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        const job = new JobPost({
            ...req.body,
            recruiter: req.user._id
        });
        const savedJob = await job.save();
        
        // Add job to recruiter's postedJobs
        await User.findByIdAndUpdate(req.user._id, {
            $push: { postedJobs: savedJob._id }
        });

        res.status(201).json({
            success: true,
            message: 'Job posted successfully',
            data: savedJob
        });
    } catch (error) {
        console.error('Error posting job:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to post job',
            errors: error.errors || []
        });
    }
};

// Get applied candidates (recruiter)
exports.getAppliedCandidates = async (req, res) => {
    try {
        const { jobId } = req.params;
        console.log('GET /jobs/:jobId/applications request received');
        console.log('Job ID:', jobId);
        console.log('User:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');
        
        // Validate ObjectId format
        if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID format'
            });
        }
        
        // Verify job exists and belongs to recruiter
        const job = await JobPost.findOne({
            _id: jobId,
            recruiter: req.user._id
        });
        
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or not authorized'
            });
        }

        const applications = await Application.find({ job: jobId })
            .populate('applicant', 'name email phone location profilePic')
            .populate('job', 'title')
            .sort('-appliedAt');

        // Get resume data for each applicant
        const Resume = require('../models/Resume');
        const applicationsWithResumes = await Promise.all(
            applications.map(async (application) => {
                const resume = await Resume.findOne({
                    user: application.applicant._id,
                    isActive: true
                }).select('cloudinarySecureUrl downloadUrl filename mimeType fileSize');

                return {
                    ...application.toObject(),
                    resume: resume
                };
            })
        );

        res.json({
            success: true,
            message: 'Applicants retrieved successfully',
            data: {
                job: {
                    id: job._id,
                    title: job.title,
                    organization: job.organization
                },
                applications: applicationsWithResumes,
                total: applicationsWithResumes.length
            }
        });
    } catch (error) {
        console.error('Error getting applied candidates:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get applied candidates'
        });
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

        console.log('PUT /jobs/:jobId request received');
        console.log('Job ID:', jobId);
        console.log('Updates:', updates);
        console.log('User:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');

        const job = await JobPost.findOne({
            _id: jobId,
            recruiter: req.user._id
        });

        if (!job) {
            console.log('Job not found or not owned by recruiter');
            return res.status(404).json({
                success: false,
                message: 'Job not found or you are not authorized to update this job'
            });
        }

        Object.keys(updates).forEach(key => {
            job[key] = updates[key];
        });

        await job.save();

        console.log('Job updated successfully:', job._id);
        res.json({
            success: true,
            message: 'Job updated successfully',
            data: job
        });
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
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
        
        // Delete all existing resumes (both from database and Cloudinary)
        const deleteResult = await deleteUserResumes(userId);
        console.log(`Cleanup completed: ${deleteResult.deletedCount} resume records deleted, ${deleteResult.cloudinaryFilesDeleted} files removed from Cloudinary`);

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
        await user.save();

        res.status(201).json({
            message: deleteResult.deletedCount > 0 
                ? `Resume uploaded successfully. Previous resume replaced.` 
                : 'Resume uploaded and parsed successfully',
            resume: {
                id: resume._id,
                filename: resume.filename,
                fileUrl: resume.fileUrl,
                cloudinaryUrl: resume.cloudinaryUrl,
                downloadUrl: resume.downloadUrl,
                fileSize: resume.fileSize,
                originalSize: resume.originalSize,
                mimeType: resume.mimeType,
                uploadedAt: resume.uploadedAt,
                parsedData: resume.parsedData
            },
            previousResumeDeleted: deleteResult.deletedCount > 0
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

// Get user's active resume
exports.getUserActiveResume = async (req, res) => {
    try {
        const activeResume = await Resume.findOne({
            user: req.user._id,
            isActive: true
        }).select('-parsedText -__v');

        if (!activeResume) {
            return res.status(200).json({
                message: 'No active resume found',
                activeResume: null,
                hasActiveResume: false
            });
        }

        res.json({
            message: 'Active resume found',
            activeResume: activeResume,
            hasActiveResume: true,
            ...activeResume.toObject()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user's active resume by user ID (for recruiters)
exports.getUserActiveResumeById = async (req, res) => {
    try {
        const { userId } = req.params;

        // Only recruiters can access other users' resumes
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access user resumes'
            });
        }

        const activeResume = await Resume.findOne({
            user: userId,
            isActive: true
        }).select('cloudinarySecureUrl downloadUrl filename mimeType fileSize uploadedAt');

        if (!activeResume) {
            return res.status(200).json({
                success: true,
                message: 'No active resume found',
                resume: null,
                hasResume: false
            });
        }

        res.json({
            success: true,
            message: 'Resume found',
            resume: activeResume,
            hasResume: true
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
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
                                resolve(); // Continue even if Cloudinary delete fails
                            } else {
                                resolve(result);
                            }
                        }
                    );
                });
            } catch (cloudinaryError) {
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

        // Check if user has permission to view this resume
        if (resume.user.toString() !== req.user._id.toString() && req.user.role !== 'recruiter') {
            return res.status(403).json({ message: 'Not authorized to view this resume' });
        }

        // Generate a signed URL for temporary access
        const signedUrl = cloudinary.v2.url(resume.cloudinaryPublicId, {
            resource_type: 'raw',
            secure: true,
            sign_url: true,
            expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
        });

        res.json({
            resume: {
                id: resume._id,
                filename: resume.filename,
                fileUrl: signedUrl,
                mimeType: resume.mimeType,
                fileSize: resume.fileSize,
                uploadedAt: resume.uploadedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get jobseeker stats for dashboard
exports.getJobseekerStats = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get total applications
        const totalApplications = await Application.countDocuments({ applicant: userId });
        
        // Get pending applications
        const pendingApplications = await Application.countDocuments({ 
            applicant: userId, 
            status: 'pending' 
        });        // Get interview count
        const interviews = await Application.countDocuments({ 
            applicant: userId, 
            status: 'interview' 
        });
        
        // Get rejections
        const rejections = await Application.countDocuments({ 
            applicant: userId, 
            status: 'rejected' 
        });
          // Check if user has active resume
        const hasActiveResume = await Resume.exists({ user: userId, isActive: true });

        // Get saved jobs count
        const savedJobs = await SavedJob.countDocuments({ user: userId });

        // Get unread messages count
        const userChats = await Chat.find({
            'participants.user': userId,
            isActive: true
        }).distinct('_id');

        const unreadMessages = await Message.countDocuments({
            chat: { $in: userChats },
            sender: { $ne: userId },
            'readBy.user': { $ne: userId }
        });
        
        res.json({
            appliedJobs: totalApplications,
            savedJobs: savedJobs,
            interviews: interviews,
            unreadMessages: unreadMessages,
            pendingApplications: pendingApplications,
            rejections: rejections,
            hasActiveResume: !!hasActiveResume
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get recommended jobs based on user skills and preferences
exports.getRecommendedJobs = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user.id;
        
        // Get user's jobseeker profile with skills
        const jobseekerProfile = await JobSeekerProfile.findOne({ user: userId });
        
        if (!jobseekerProfile) {
            return res.json({
                jobs: [],
                pagination: {
                    currentPage: Number(page),
                    totalPages: 0,
                    totalJobs: 0,
                    hasNext: false,
                    hasPrev: false
                }
            });
        }
        
        const userSkills = jobseekerProfile.skills.map(skill => skill.name);
        const userPreferences = jobseekerProfile.jobPreferences || {};
        
        // Build query for recommendations
        const query = { status: 'active' };
        
        // Match skills if user has skills
        if (userSkills.length > 0) {
            query['requirements.skills.required'] = { 
                $in: userSkills.map(skill => new RegExp(escapeRegExp(skill), 'i'))
            };
        }
        
        // Apply user preferences
        if (userPreferences.jobTypes && userPreferences.jobTypes.length > 0) {
            query.jobType = { $in: userPreferences.jobTypes };
        }
        
        if (userPreferences.workModes && userPreferences.workModes.length > 0) {
            query.workMode = { $in: userPreferences.workModes };
        }
        
        if (userPreferences.locations && userPreferences.locations.length > 0) {
            query.location = { 
                $in: userPreferences.locations.map(loc => new RegExp(escapeRegExp(loc), 'i'))
            };
        }
        
        // Salary range filter
        if (userPreferences.salaryRange && userPreferences.salaryRange.min) {
            query['salary.max'] = { $gte: userPreferences.salaryRange.min };
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

// Update application status (for testing/recruiter use)
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;

        console.log('PUT /jobs/applications/:applicationId/status request received');
        console.log('Application ID:', applicationId);
        console.log('New Status:', status);
        console.log('User:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');
        
        // Validate status
        const validStatuses = ['applied', 'reviewed', 'shortlisted', 'interview', 'rejected', 'hired'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status',
                validStatuses
            });
        }
        
        const application = await Application.findById(applicationId)
            .populate({
                path: 'job',
                populate: {
                    path: 'organization',
                    select: 'name'
                }
            })
            .populate('applicant');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check if user is the recruiter of the job or the applicant (for testing)
        const isRecruiter = application.job.recruiter.toString() === req.user._id.toString();
        const isApplicant = application.applicant._id.toString() === req.user._id.toString();

        if (!isRecruiter && !isApplicant) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to update this application'
            });
        }

        // Store old status to check if it changed
        const oldStatus = application.status;

        application.status = status;
        await application.save();

        // Send email notifications for status changes (only if recruiter is updating)
        if (isRecruiter && oldStatus !== status) {
            const applicantEmail = application.applicant.email;
            const applicantName = application.applicant.name;
            const jobTitle = application.job.title;
            const companyName = application.job.organization?.name || 'Company';

            if (status === 'interview') {
                // Send interview notification email
                sendInterviewEmail(applicantEmail, applicantName, jobTitle, companyName)
                    .then(result => {
                        if (result.success) {
                            console.log(`Interview email sent to ${applicantEmail} for job: ${jobTitle}`);
                        } else {
                            console.error(`Failed to send interview email to ${applicantEmail}:`, result.message);
                        }
                    })
                    .catch(error => {
                        console.error(`Error sending interview email to ${applicantEmail}:`, error);
                    });
            } else if (status === 'hired') {
                // Send hired notification email
                sendHiredEmail(applicantEmail, applicantName, jobTitle, companyName)
                    .then(result => {
                        if (result.success) {
                            console.log(`Hired email sent to ${applicantEmail} for job: ${jobTitle}`);
                        } else {
                            console.error(`Failed to send hired email to ${applicantEmail}:`, result.message);
                        }
                    })
                    .catch(error => {
                        console.error(`Error sending hired email to ${applicantEmail}:`, error);
                    });
            }
        }
        
        res.json({
            success: true,
            message: 'Application status updated successfully',
            data: application
        });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get recruiter details by ID
exports.getRecruiterById = async (req, res) => {
    try {
        const { recruiterId } = req.params;

        // Validate ObjectId format
        if (!recruiterId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid recruiter ID format' });
        }

        const recruiter = await User.findById(recruiterId)
            .select('name email phone profilePic location role');

        if (!recruiter) {
            return res.status(404).json({ message: 'Recruiter not found' });
        }

        if (recruiter.role !== 'recruiter') {
            return res.status(400).json({ message: 'User is not a recruiter' });
        }

        // Get recruiter profile with organization
        const recruiterProfile = await Recruiter.findOne({ user: recruiterId })
            .populate('organizationId', 'name logo contact description');

        res.json({
            recruiter: {
                ...recruiter?.toObject(),
                recruiterProfile: recruiterProfile,
                title: recruiterProfile?.title,
                organization: recruiterProfile?.organizationId || null
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get company details by organization ID
exports.getCompanyById = async (req, res) => {
    try {
        const { companyId } = req.params;

        // Validate ObjectId format
        if (!companyId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid company ID format' });
        }

        const company = await Organization.findById(companyId);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // Get recruiters for this organization
        const recruiters = await Recruiter.find({ organizationId: companyId })
            .populate('user', 'name email phone profilePic')
            .select('user title department');

        res.json({
            company: {
                ...company.toObject(),
                recruiters: recruiters.map(recruiter => ({
                    ...recruiter.user.toObject(),
                    title: recruiter.title,
                    department: recruiter.department
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get jobs by organization ID
exports.getJobsByOrganization = async (req, res) => {
    try {
        const { organizationId } = req.params;
        const { page = 1, limit = 10, status = 'active' } = req.query;

        // Validate ObjectId format
        if (!organizationId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid organization ID format'
            });
        }

        // Build query
        const query = { organization: organizationId };
        if (status) {
            query.status = status;
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
            success: true,
            data: jobs,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalJobs: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get recruiter's posted jobs
exports.getRecruiterJobs = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const recruiterId = req.user._id;

        // Build query
        const query = { recruiter: recruiterId };
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const jobs = await JobPost.find(query)
            .populate('organization', 'name logo location')
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit));

        // Get application counts for each job
        const jobsWithApplications = await Promise.all(
            jobs.map(async (job) => {
                const applicationCount = await Application.countDocuments({ job: job._id });
                const newApplicationsToday = await Application.countDocuments({
                    job: job._id,
                    appliedAt: {
                        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        $lt: new Date(new Date().setHours(23, 59, 59, 999))
                    }
                });

                return {
                    ...job.toObject(),
                    applicationCount,
                    newApplicationsToday
                };
            })
        );

        const total = await JobPost.countDocuments(query);

        res.json({
            jobs: jobsWithApplications,
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

// Get recruiter dashboard statistics
exports.getRecruiterStats = async (req, res) => {
    try {
        const recruiterId = req.user._id;

        // Get total jobs posted
        const totalJobs = await JobPost.countDocuments({ recruiter: recruiterId });

        // Get active jobs
        const activeJobs = await JobPost.countDocuments({
            recruiter: recruiterId,
            status: 'active'
        });

        // Get draft jobs
        const draftJobs = await JobPost.countDocuments({
            recruiter: recruiterId,
            status: 'draft'
        });

        // Get closed jobs
        const closedJobs = await JobPost.countDocuments({
            recruiter: recruiterId,
            status: 'closed'
        });

        // Get all applications for recruiter's jobs
        const recruiterJobs = await JobPost.find({ recruiter: recruiterId }).select('_id');
        const jobIds = recruiterJobs.map(job => job._id);

        const totalApplications = await Application.countDocuments({
            job: { $in: jobIds }
        });

        // Get applications by status
        const pendingApplications = await Application.countDocuments({
            job: { $in: jobIds },
            status: 'applied'
        });

        const reviewedApplications = await Application.countDocuments({
            job: { $in: jobIds },
            status: 'reviewed'
        });

        const shortlistedApplications = await Application.countDocuments({
            job: { $in: jobIds },
            status: 'shortlisted'
        });

        const interviewApplications = await Application.countDocuments({
            job: { $in: jobIds },
            status: 'interview'
        });

        const hiredApplications = await Application.countDocuments({
            job: { $in: jobIds },
            status: 'hired'
        });

        const rejectedApplications = await Application.countDocuments({
            job: { $in: jobIds },
            status: 'rejected'
        });

        // Get new applications today
        const newApplicationsToday = await Application.countDocuments({
            job: { $in: jobIds },
            appliedAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
        });

        res.json({
            jobs: {
                total: totalJobs,
                active: activeJobs,
                draft: draftJobs,
                closed: closedJobs
            },
            applications: {
                total: totalApplications,
                pending: pendingApplications,
                reviewed: reviewedApplications,
                shortlisted: shortlistedApplications,
                interview: interviewApplications,
                hired: hiredApplications,
                rejected: rejectedApplications,
                newToday: newApplicationsToday
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get analytics for a specific job
exports.getJobAnalytics = async (req, res) => {
    try {
        const { jobId } = req.params;
        const recruiterId = req.user._id;

        // Validate ObjectId format
        if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID format'
            });
        }

        // Verify job exists and belongs to recruiter
        const job = await JobPost.findOne({
            _id: jobId,
            recruiter: recruiterId
        }).populate('organization', 'name logo');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or not authorized'
            });
        }

        // Get application analytics
        const totalApplications = await Application.countDocuments({ job: jobId });

        const applicationsByStatus = await Application.aggregate([
            { $match: { job: new mongoose.Types.ObjectId(jobId) } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Get applications over time (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const applicationsOverTime = await Application.aggregate([
            {
                $match: {
                    job: new mongoose.Types.ObjectId(jobId),
                    appliedAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$appliedAt' },
                        month: { $month: '$appliedAt' },
                        day: { $dayOfMonth: '$appliedAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        // Get top skills from applicants
        const topSkills = await Application.aggregate([
            { $match: { job: new mongoose.Types.ObjectId(jobId) } },
            { $lookup: { from: 'users', localField: 'applicant', foreignField: '_id', as: 'applicantData' } },
            { $unwind: '$applicantData' },
            { $unwind: '$applicantData.skills' },
            { $group: { _id: '$applicantData.skills', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Calculate average ATS score
        const atsStats = await Application.aggregate([
            { $match: { job: new mongoose.Types.ObjectId(jobId) } },
            {
                $group: {
                    _id: null,
                    avgScore: { $avg: '$atsScore' },
                    maxScore: { $max: '$atsScore' },
                    minScore: { $min: '$atsScore' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                job: {
                    id: job._id,
                    title: job.title,
                    status: job.status,
                    createdAt: job.createdAt,
                    organization: job.organization
                },
                analytics: {
                    totalApplications,
                    applicationsByStatus: applicationsByStatus.reduce((acc, item) => {
                        acc[item._id] = item.count;
                        return acc;
                    }, {}),
                    applicationsOverTime,
                    topSkills: topSkills.map(skill => ({
                        skill: skill._id,
                        count: skill.count
                    })),
                    atsStats: atsStats[0] || { avgScore: 0, maxScore: 0, minScore: 0 }
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get overall analytics for recruiter's jobs
exports.getRecruiterAnalytics = async (req, res) => {
    try {
        const recruiterId = req.user._id;
        const { startDate, endDate } = req.query;

        console.log('GET /jobs/recruiter/analytics request received');
        console.log('Recruiter ID:', recruiterId);
        console.log('Date range:', { startDate, endDate });
        console.log('Query params:', req.query);

        // Build date filter
        let dateFilter = {};
        if (startDate && startDate.trim() !== '') {
            dateFilter.createdAt = dateFilter.createdAt || {};
            dateFilter.createdAt.$gte = new Date(startDate);
            console.log('Start date filter:', new Date(startDate));
        }
        if (endDate && endDate.trim() !== '') {
            dateFilter.createdAt = dateFilter.createdAt || {};
            // Add one day to endDate to include the entire end date
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);
            dateFilter.createdAt.$lte = endDateTime;
            console.log('End date filter:', endDateTime);
        }
        console.log('Date filter applied:', dateFilter);

        // Get recruiter's jobs
        const recruiterJobs = await JobPost.find({
            recruiter: recruiterId,
            ...dateFilter
        }).select('_id title createdAt status');

        console.log('Found recruiter jobs:', recruiterJobs.length);
        console.log('Job details:', recruiterJobs.map(job => ({
            id: job._id,
            title: job.title,
            createdAt: job.createdAt,
            status: job.status
        })));

        const jobIds = recruiterJobs.map(job => job._id);
        console.log('Job IDs for analytics:', jobIds);

        // Jobs created over time
        let jobsOverTime = [];
        try {
            jobsOverTime = await JobPost.aggregate([
                { $match: { recruiter: new mongoose.Types.ObjectId(recruiterId), ...dateFilter } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]);
            console.log('Jobs over time result:', jobsOverTime);
        } catch (error) {
            console.error('Error in jobsOverTime aggregation:', error);
        }

        // Applications over time
        let applicationsOverTime = [];
        try {
            if (jobIds.length > 0) {
                applicationsOverTime = await Application.aggregate([
                    { $match: { job: { $in: jobIds } } },
                    {
                        $group: {
                            _id: {
                                year: { $year: '$appliedAt' },
                                month: { $month: '$appliedAt' }
                            },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { '_id.year': 1, '_id.month': 1 } }
                ]);
            }
            console.log('Applications over time result:', applicationsOverTime);
        } catch (error) {
            console.error('Error in applicationsOverTime aggregation:', error);
        }

        // Top performing jobs (by application count)
        let topJobs = [];
        try {
            if (jobIds.length > 0) {
                topJobs = await Application.aggregate([
                    { $match: { job: { $in: jobIds } } },
                    { $group: { _id: '$job', applicationCount: { $sum: 1 } } },
                    { $lookup: { from: 'jobposts', localField: '_id', foreignField: '_id', as: 'jobData' } },
                    { $unwind: '$jobData' },
                    { $sort: { applicationCount: -1 } },
                    { $limit: 5 },
                    {
                        $project: {
                            jobId: '$_id',
                            title: '$jobData.title',
                            applicationCount: 1
                        }
                    }
                ]);
            }
            console.log('Top jobs result:', topJobs);
        } catch (error) {
            console.error('Error in topJobs aggregation:', error);
        }

        // Get total applications count
        const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });
        console.log('Total applications found:', totalApplications);

        const analyticsData = {
            summary: {
                totalJobs: recruiterJobs.length,
                totalApplications: totalApplications
            },
            jobsOverTime,
            applicationsOverTime,
            topJobs
        };

        console.log('Final analytics data:', JSON.stringify(analyticsData, null, 2));

        res.json({
            success: true,
            data: analyticsData
        });
    } catch (error) {
        console.error('Error getting recruiter analytics:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Save a job for later
exports.saveJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user._id;

        // Check if job exists
        const job = await JobPost.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check if job is already saved
        const existingSavedJob = await SavedJob.findOne({ user: userId, job: jobId });
        if (existingSavedJob) {
            return res.status(400).json({
                success: false,
                message: 'Job is already saved'
            });
        }

        // Save the job
        const savedJob = new SavedJob({
            user: userId,
            job: jobId
        });

        await savedJob.save();

        res.status(201).json({
            success: true,
            message: 'Job saved successfully',
            data: savedJob
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Remove a saved job
exports.unsaveJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user._id;

        const savedJob = await SavedJob.findOneAndDelete({ user: userId, job: jobId });

        if (!savedJob) {
            return res.status(404).json({
                success: false,
                message: 'Saved job not found'
            });
        }

        res.json({
            success: true,
            message: 'Job removed from saved jobs'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all saved jobs for a user
exports.getSavedJobs = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const savedJobs = await SavedJob.find({ user: userId })
            .populate({
                path: 'job',
                populate: {
                    path: 'organization',
                    select: 'name logo location'
                }
            })
            .sort({ savedAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await SavedJob.countDocuments({ user: userId });

        // Filter out any saved jobs where the job has been deleted
        const validSavedJobs = savedJobs.filter(savedJob => savedJob.job);

        res.json({
            success: true,
            data: {
                savedJobs: validSavedJobs,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Check if a job is saved by the user
exports.checkJobSaved = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user._id;

        const savedJob = await SavedJob.findOne({ user: userId, job: jobId });

        res.json({
            success: true,
            isSaved: !!savedJob
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};