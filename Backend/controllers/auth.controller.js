const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const JobSeekerProfile = require('../models/JobSeeker');
const Organization = require('../models/Organizations');
const Recruiter = require('../models/Recruiter');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryService');

// Register new user
exports.register = async (req, res) => {
    try {
        const { email, password, role, name, organizationId, ...profileData } = req.body;

        // Check if role is valid
        if (!['recruiter', 'jobseeker'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // For recruiters, organizationId is required
        if (role === 'recruiter' && !organizationId) {
            return res.status(400).json({ message: 'Organization selection is required for recruiters' });
        }

        // If recruiter, verify organization exists
        if (role === 'recruiter' && organizationId) {
            const organization = await Organization.findById(organizationId);
            if (!organization) {
                return res.status(400).json({ message: 'Selected organization does not exist' });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with proper error handling for duplicate email
        try {
            const user = new User({
                email,
                password: hashedPassword,
                role,
                name,
                ...profileData
            });

            await user.save();

            // If recruiter, create recruiter profile
            if (role === 'recruiter' && organizationId) {
                const recruiterProfile = new Recruiter({
                    user: user._id,
                    organizationId: organizationId
                });
                await recruiterProfile.save();
            }

            // Generate token
            const token = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    name: user.name,
                    organizationId: role === 'recruiter' ? organizationId : undefined
                }
            });
        } catch (err) {
            // Handle duplicate key error (E11000) or transformed duplicate error
            if (err.code === 11000 || err.isDuplicateError || (err.message && err.message.includes('Email address already exists'))) {
                return res.status(400).json({ message: 'User with this email already exists' });
            }
            throw err; // Re-throw other errors to be caught by the outer catch block
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'An error occurred during registration' });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );        // Get recruiter profile if user is a recruiter
        let organizationId = null;
        if (user.role === 'recruiter') {
            const recruiterProfile = await Recruiter.findOne({ user: user._id });
            if (recruiterProfile) {
                organizationId = recruiterProfile.organizationId;
            }
        }

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                organizationId: organizationId
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        // The user is already attached to req.user by the authenticate middleware
        const user = req.user;
        
        // Convert to a plain object and remove the password field
        const userData = user.toObject();
        delete userData.password;
        
        // If jobseeker, include profile and active resume info
        if (user.role === 'jobseeker') {
            const jobseekerProfile = await JobSeekerProfile.findOne({ user: user._id })
                .populate('activeResume');

            if (jobseekerProfile) {
                userData.jobseekerProfile = jobseekerProfile;
            }

            // Get active resume info
            const activeResume = await require('../models/Resume').findOne({
                user: user._id,
                isActive: true
            }).select('filename cloudinarySecureUrl uploadedAt fileSize mimeType');

            if (activeResume) {
                userData.activeResume = activeResume;
            }
        }

        // If recruiter, include recruiter profile info
        if (user.role === 'recruiter') {
            const recruiterProfile = await Recruiter.findOne({ user: user._id })
                .populate('organizationId');

            if (recruiterProfile) {
                userData.recruiterProfile = recruiterProfile;
                // For backward compatibility, also set organizationId at user level
                userData.organizationId = recruiterProfile.organizationId;
            }
        }
        
        res.json({ user: userData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const updateData = req.body;
        const userRole = req.user.role;

        // Remove sensitive fields that shouldn't be updated
        delete updateData.password;
        delete updateData.email;
        delete updateData.role;

        // Start a session for transaction (ensures all or nothing updates)
        const session = await mongoose.startSession();
        session.startTransaction();        try {            // Check if profile should be marked as completed
            const hasBasicInfo = updateData.name && updateData.phone;
            const hasJobseekerData = userRole === 'jobseeker' && 
                updateData.skills && updateData.skills.length > 0 &&
                updateData.experience && updateData.experience.length > 0 &&
                updateData.education && updateData.education.length > 0;
            
            const profileCompleted = hasBasicInfo && (userRole !== 'jobseeker' || hasJobseekerData);

            // Update basic user data
            const user = await User.findByIdAndUpdate(
                userId,
                { 
                    name: updateData.name,
                    phone: updateData.phone,
                    location: updateData.location,
                    profileCompleted: profileCompleted
                    // Profile picture is handled by the uploadProfilePicture route
                },
                { new: true, runValidators: true, session }
            ).select('-password');

            if (!user) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: 'User not found' });
            }

            // Handle role-specific profile updates
            if (userRole === 'jobseeker') {
                // Get or create jobseeker profile
                let jobseekerProfile = await JobSeekerProfile.findOne({ user: userId }).session(session);
                
                if (!jobseekerProfile) {                    jobseekerProfile = new JobSeekerProfile({
                        user: userId,
                        skills: updateData.skills || [],
                        experience: updateData.experience || [],
                        education: updateData.education || [],
                        bio: updateData.bio || '',
                        jobPreferences: updateData.jobPreferences || {}
                    });} else {
                    // Update existing profile
                    if (updateData.skills) jobseekerProfile.skills = updateData.skills;
                    if (updateData.experience) jobseekerProfile.experience = updateData.experience;
                    if (updateData.education) jobseekerProfile.education = updateData.education;
                    if (updateData.jobPreferences) jobseekerProfile.jobPreferences = updateData.jobPreferences;
                    if (updateData.bio) jobseekerProfile.bio = updateData.bio;
                    if (updateData.activeResume) jobseekerProfile.activeResume = updateData.activeResume;
                }
                
                await jobseekerProfile.save({ session });
                
                // Commit transaction
                await session.commitTransaction();
                session.endSession();
                
                return res.json({
                    message: 'Profile updated successfully',
                    user,
                    jobseekerProfile
                });
            }
            else if (userRole === 'recruiter') {
                // Get or create recruiter profile
                let recruiterProfile = await Recruiter.findOne({ user: userId }).session(session);

                if (!recruiterProfile) {
                    // This shouldn't happen if registration worked correctly, but handle it
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({
                        message: 'Recruiter profile not found. Please contact support.'
                    });
                }

                // Update recruiter profile fields
                if (updateData.title) recruiterProfile.title = updateData.title;
                if (updateData.bio) recruiterProfile.bio = updateData.bio;
                if (updateData.department) recruiterProfile.department = updateData.department;
                if (updateData.yearsOfExperience !== undefined) recruiterProfile.yearsOfExperience = updateData.yearsOfExperience;
                if (updateData.linkedinProfile) recruiterProfile.linkedinProfile = updateData.linkedinProfile;
                if (updateData.specializations) recruiterProfile.specializations = updateData.specializations;
                if (updateData.skills) recruiterProfile.skills = updateData.skills;
                if (updateData.workExperience) recruiterProfile.workExperience = updateData.workExperience;
                if (updateData.education) recruiterProfile.education = updateData.education;
                if (updateData.certifications) recruiterProfile.certifications = updateData.certifications;

                await recruiterProfile.save({ session });

                // Commit transaction
                await session.commitTransaction();
                session.endSession();

                return res.json({
                    message: 'Profile updated successfully',
                    user,
                    recruiterProfile
                });
            }
            
            // For admin or other roles, just return the updated user
            await session.commitTransaction();
            session.endSession();
            
            res.json({
                message: 'Profile updated successfully',
                user
            });
        } catch (error) {
            // Rollback transaction on error
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: error.message || 'An error occurred during profile update' });
    }
};

// Admin login
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin user
        const admin = await User.findOne({ email, role: 'admin' });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: admin._id,                
                email: admin.email,
                role: admin.role,
                name: admin.name
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No profile picture provided' });
        }
        
        // Get the existing user to check if they already have a profile pic
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Delete old profile picture from Cloudinary if it exists
        if (user.profilePicPublicId) {
            await deleteFromCloudinary(user.profilePicPublicId);
        }
          // Upload new profile picture to Cloudinary
        const fileBuffer = req.file.buffer;
        const fileFormat = req.file.mimetype.split('/')[1]; // Extract format from mimetype
        
        const result = await uploadToCloudinary(fileBuffer, {
            folder: 'profiles',
            resourceType: 'image',
            format: fileFormat,
            transformation: [
                { width: 800, height: 800, crop: 'limit' }, // Resize image for optimization
                { quality: 'auto:good' } // Optimize quality
            ]
        });
        
        // Update user profile with new profile picture URL
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                profilePic: result.secure_url,
                profilePicPublicId: result.public_id,
                profileCompleted: true
            },
            { new: true }
        ).select('-password');
        
        res.json({
            message: 'Profile picture uploaded successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Profile picture upload error:', error);
        res.status(500).json({ message: 'An error occurred during profile picture upload' });
    }
};

// Get user profile by ID (for recruiters to view applicant profiles)
exports.getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate ObjectId format
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        // Get user profile
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // If jobseeker, include profile data
        if (user.role === 'jobseeker') {
            const jobseekerProfile = await JobSeekerProfile.findOne({ user: user._id });

            if (jobseekerProfile) {
                const userData = user.toObject();
                userData.jobseekerProfile = jobseekerProfile;
                return res.json({
                    success: true,
                    user: userData
                });
            }
        }

        res.json({
            success: true,
            user: user
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Initialize test users if needed
const testUsers = async () => {
    try {
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (!existingAdmin) {
            const adminUser = {
                email: 'admin@jobconnect.com',
                password: await bcrypt.hash('admin123', 10),
                role: 'admin',
                name: 'Admin'
            };
            await User.create(adminUser);
            console.log('Admin user created successfully');
        }
    } catch (error) {
        console.error('Error initializing users:', error);
    }
};

testUsers();

// Change recruiter's organization
exports.changeOrganization = async (req, res) => {
    try {
        const userId = req.user._id;
        const { organizationId } = req.body;

        // Verify user is a recruiter
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({
                message: 'Only recruiters can change organizations'
            });
        }

        // Verify new organization exists
        const newOrganization = await Organization.findById(organizationId);
        if (!newOrganization) {
            return res.status(404).json({
                message: 'Organization not found'
            });
        }

        // Get current recruiter profile
        const recruiterProfile = await Recruiter.findOne({ user: userId });
        if (!recruiterProfile) {
            return res.status(404).json({
                message: 'Recruiter profile not found'
            });
        }

        const oldOrganizationId = recruiterProfile.organizationId;

        // Start transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Update recruiter's organizationId
            await Recruiter.findByIdAndUpdate(
                recruiterProfile._id,
                { organizationId: organizationId },
                { session }
            );

            await session.commitTransaction();
            session.endSession();

            // Get updated user with recruiter profile
            const user = await User.findById(userId).select('-password');
            const updatedRecruiterProfile = await Recruiter.findOne({ user: userId })
                .populate('organizationId');

            res.json({
                message: 'Organization changed successfully',
                user: user,
                recruiterProfile: updatedRecruiterProfile
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    } catch (error) {
        console.error('Change organization error:', error);
        res.status(500).json({
            message: 'Failed to change organization',
            error: error.message
        });
    }
};

// Export all controller methods
module.exports = {
    register: exports.register,
    login: exports.login,
    adminLogin: exports.adminLogin,
    getProfile: exports.getProfile,
    updateProfile: exports.updateProfile,
    uploadProfilePicture: exports.uploadProfilePicture,
    getUserProfile: exports.getUserProfile,
    changeOrganization: exports.changeOrganization
};