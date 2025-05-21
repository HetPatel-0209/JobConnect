const JobPost = require('../models/JobPost');
const User = require('../models/User');

// Get all job posts
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await JobPost.find({ status: 'active' })
            .populate('recruiter', 'name company');
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get jobs by location
exports.getJobsByLocation = async (req, res) => {
    try {
        const { location } = req.user;
        const jobs = await JobPost.find({ 
            location: location,
            status: 'active'
        }).populate('recruiter', 'name company');
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get jobs by skills
exports.getJobsBySkills = async (req, res) => {
    try {
        const { skills } = req.user;
        const jobs = await JobPost.find({
            skills: { $in: skills },
            status: 'active'
        }).populate('recruiter', 'name company');
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get applied jobs
exports.getAppliedJobs = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'appliedJobs',
                populate: { path: 'recruiter', select: 'name company' }
            });
        res.json(user.appliedJobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Calculate ATS score
exports.calculateATSScore = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await JobPost.findById(jobId);
        const user = await User.findById(req.user._id);

        // Basic scoring algorithm
        let score = 0;
        const totalRequirements = job.requirements.length;
        
        // Match skills
        const userSkills = user.skills.map(skill => skill.toLowerCase());
        const jobSkills = job.skills.map(skill => skill.toLowerCase());
        const matchingSkills = jobSkills.filter(skill => userSkills.includes(skill));
        score += (matchingSkills.length / jobSkills.length) * 50;

        // Match experience (basic check)
        if (user.experience && user.experience.length > 0) {
            score += 25;
        }

        // Match education (basic check)
        if (user.education && user.education.length > 0) {
            score += 25;
        }

        res.json({ atsScore: Math.round(score) });
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
        const job = await JobPost.findById(jobId)
            .populate({
                path: 'applications.jobseeker',
                select: 'name email skills experience education'
            });
        
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.recruiter.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(job.applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Apply for a job
exports.applyForJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user._id;

        const job = await JobPost.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if already applied
        const alreadyApplied = job.applications.some(
            app => app.jobseeker.toString() === userId.toString()
        );
        if (alreadyApplied) {
            return res.status(400).json({ message: 'Already applied to this job' });
        }

        // Calculate ATS score
        let score = 0;
        const user = await User.findById(userId);
        const userSkills = user.skills.map(skill => skill.toLowerCase());
        const jobSkills = job.skills.map(skill => skill.toLowerCase());
        const matchingSkills = jobSkills.filter(skill => userSkills.includes(skill));
        score += (matchingSkills.length / jobSkills.length) * 50;
        if (user.experience && user.experience.length > 0) score += 25;
        if (user.education && user.education.length > 0) score += 25;

        // Add application to job
        job.applications.push({
            jobseeker: userId,
            atsScore: Math.round(score)
        });
        await job.save();

        // Add job to user's applied jobs
        await User.findByIdAndUpdate(userId, {
            $push: { appliedJobs: jobId }
        });

        res.status(201).json({ message: 'Successfully applied to job' });
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
        );

        await job.remove();
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search jobs
exports.searchJobs = async (req, res) => {
    try {
        const { query, skills, location, type } = req.query;
        const searchCriteria = { status: 'active' };

        if (query) {
            searchCriteria.$or = [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { company: { $regex: query, $options: 'i' } }
            ];
        }

        if (skills) {
            const skillsArray = skills.split(',').map(skill => skill.trim());
            searchCriteria.skills = { $in: skillsArray };
        }

        if (location) {
            searchCriteria.location = { $regex: location, $options: 'i' };
        }

        if (type) {
            searchCriteria.type = type;
        }

        const jobs = await JobPost.find(searchCriteria)
            .populate('recruiter', 'name company')
            .sort('-createdAt');

        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
