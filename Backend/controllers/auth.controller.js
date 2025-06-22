const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const JobSeekerProfile = require('../models/JobSeeker');
const Organization = require('../models/Organizations');
const Recruiter = require('../models/Recruiter');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryService');
const { sendWelcomeEmail } = require('../utils/emailService');

// Register new user
exports.register = async (req, res) => {
    try {
        const { email, password, role, name, organizationId, ...profileData } = req.body;

        if (!['recruiter', 'jobseeker'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        if (role === 'recruiter' && !organizationId) {
            return res.status(400).json({ message: 'Organization selection is required for recruiters' });
        }

        if (role === 'recruiter' && organizationId) {
            const organization = await Organization.findById(organizationId);
            if (!organization) {
                return res.status(400).json({ message: 'Selected organization does not exist' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = new User({
                email,
                password: hashedPassword,
                role,
                name,
                ...profileData
            });

            await user.save();

            if (role === 'recruiter' && organizationId) {
                const recruiterProfile = new Recruiter({
                    user: user.id,
                    organizationId: organizationId
                });
                await recruiterProfile.save();
            }

            const token = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            sendWelcomeEmail(user.email, user.name, user.role)
                .then(result => {
                    if (result.success) {
                        console.log(`Welcome email sent to ${user.email}`);
                    } else {
                        console.error(`Failed to send welcome email  ${user.email}:`, result.message);
                    }
                })
                .catch(error => {
                    console.error(`Error sending welcome email to ${user.email}:`, error);
                });

            res.status(201).json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    name: user.name,
                    organizationId: role === 'recruiter' ? organizationId : undefined
                }
            });
        } catch (err) {
            if (err.code === 11000 || err.isDuplicateError || (err.message && err.message.includes('Email address already exists'))) {
                return res.status(400).json({ message: 'User with this email already exists' });
            }
            throw err;
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
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        let organizationId = null;
        if (user.role === 'recruiter') {
            const recruiterProfile = await Recruiter.findOne({ user: user.id });
            if (recruiterProfile) {
                organizationId = recruiterProfile.organizationId;
            }
        }

        res.json({
            token,
            user: {
                id: user.id,
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
        const user = req.user;
        const userData = user.toObject();
        delete userData.password;

        if (user.role === 'jobseeker') {
            const jobseekerProfile = await JobSeekerProfile.findOne({ user: user.id })
                .populate('activeResume');
            if (jobseekerProfile) {
                userData.jobseekerProfile = jobseekerProfile;
            }

            const activeResume = await require('../models/Resume').findOne({
                user: user.id,
                isActive: true
            }).select('filename cloudinarySecureUrl uploadedAt fileSize mimeType');

            if (activeResume) {
                userData.activeResume = activeResume;
            }
        }

        // recruiter profile info
        if (user.role === 'recruiter') {
            const recruiterProfile = await Recruiter.findOne({ user: user.id })
                .populate('organizationId');

            if (recruiterProfile) {
                userData.recruiterProfile = recruiterProfile;
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

        delete updateData.password;
        delete updateData.email;
        delete updateData.role;

        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // Check if profile marked as completed
            const hasBasicInfo = updateData.name && updateData.phone;
            const hasJobseekerData = userRole === 'jobseeker' &&
                updateData.skills && updateData.skills.length > 0 &&
                updateData.experience && updateData.experience.length > 0 &&
                updateData.education && updateData.education.length > 0;

            const profileCompleted = hasBasicInfo && (userRole !== 'jobseeker' || hasJobseekerData);

            // Update user data
            const user = await User.findByIdAndUpdate(
                userId,
                {
                    name: updateData.name,
                    phone: updateData.phone,
                    location: updateData.location,
                    profileCompleted: profileCompleted
                },
                { new: true, runValidators: true, session }
            ).select('-password');

            if (!user) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: 'User not found' });
            }

            // role-specific profile updates
            if (userRole === 'jobseeker') {
                // get or create jobseeker profile
                let jobseekerProfile = await JobSeekerProfile.findOne({ user: userId }).session(session);

                if (!jobseekerProfile) {
                    jobseekerProfile = new JobSeekerProfile({
                        user: userId,
                        skills: updateData.skills || [],
                        experience: updateData.experience || [],
                        education: updateData.education || [],
                        bio: updateData.bio || '',
                        jobPreferences: updateData.jobPreferences || {}
                    });
                }
                else {
                    // update profile
                    if (updateData.skills) jobseekerProfile.skills = updateData.skills;
                    if (updateData.experience) jobseekerProfile.experience = updateData.experience;
                    if (updateData.education) jobseekerProfile.education = updateData.education;
                    if (updateData.jobPreferences) jobseekerProfile.jobPreferences = updateData.jobPreferences;
                    if (updateData.bio) jobseekerProfile.bio = updateData.bio;
                    if (updateData.activeResume) jobseekerProfile.activeResume = updateData.activeResume;
                }

                await jobseekerProfile.save({ session });
                await session.commitTransaction();
                session.endSession();

                return res.json({
                    message: 'Profile updated successfully',
                    user,
                    jobseekerProfile
                });
            }
            else if (userRole === 'recruiter') {
                // get or create recruiter profile
                let recruiterProfile = await Recruiter.findOne({ user: userId }).session(session);

                if (!recruiterProfile) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({
                        message: 'Recruiter profile not found. Please contact support.'
                    });
                }

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
                await session.commitTransaction();
                session.endSession();

                return res.json({
                    message: 'Profile updated successfully',
                    user,
                    recruiterProfile
                });
            }

            // just return the updated user
            await session.commitTransaction();
            session.endSession();

            res.json({
                message: 'Profile updated successfully',
                user
            });
        } catch (error) {
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

// upload profile picture
exports.uploadProfilePicture = async (req, res) => {
    try {
        const userId = req.user._id;

        // check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No profile picture provided' });
        }

        // get the user to check if they have a profile pic
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // delete old profile picture from Cloudinary
        if (user.profilePicPublicId) {
            await deleteFromCloudinary(user.profilePicPublicId);
        }
        const fileBuffer = req.file.buffer;
        const fileFormat = req.file.mimetype.split('/')[1];

        const result = await uploadToCloudinary(fileBuffer, {
            folder: 'profiles',
            resourceType: 'image',
            format: fileFormat,
            transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto:good' }
            ]
        });

        // update user profile with new profile picture URL
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

// get user profile by ID
exports.getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // jobseeker, include profile data
        if (user.role === 'jobseeker') {
            const jobseekerProfile = await JobSeekerProfile.findOne({ user: user.id });

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

// recruiter's organization
exports.changeOrganization = async (req, res) => {
    try {
        const userId = req.user._id;
        const { organizationId } = req.body;

        // if user is a recruiter
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({
                message: 'Only recruiters can change organizations'
            });
        }

        // verify new organization exists
        const newOrganization = await Organization.findById(organizationId);
        if (!newOrganization) {
            return res.status(404).json({
                message: 'Organization not found'
            });
        }

        // get current profile
        const recruiterProfile = await Recruiter.findOne({ user: userId });
        if (!recruiterProfile) {
            return res.status(404).json({
                message: 'Recruiter profile not found'
            });
        }

        const oldOrganizationId = recruiterProfile.organizationId;
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // update recruiter organizationId
            await Recruiter.findByIdAndUpdate(
                recruiterProfile._id,
                { organizationId: organizationId },
                { session }
            );

            await session.commitTransaction();
            session.endSession();

            // get updated user with recruiter
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

// configure nodemailer transporter
const createEmailTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // find user by email
        const user = await User.findOne({ email });
        if (!user) {
            // if email exists or not for security
            return res.json({
                message: 'If an account with that email exists, we have sent a password reset link.'
            });
        }
        // reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
        // reset token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

        // Email content / copilot
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request - JobConnect',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Password Reset Request</h2>
                    <p>Hello ${user.name},</p>
                    <p>You requested a password reset for your JobConnect account. Click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
                    </div>
                    <p>Or copy and paste this link in your browser:</p>
                    <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
                    <p><strong>This link will expire in 1 hour.</strong></p>
                    <p>If you didn't request this password reset, please ignore this email.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px;">Best regards,<br>The JobConnect Team</p>
                </div>
            `
        };

        // Send email
        const transporter = createEmailTransporter();
        await transporter.sendMail(mailOptions);

        res.json({
            message: 'If an account with that email exists, we have sent a password reset link.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
    }
};

// validate reset
exports.validateResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({ message: 'Reset token is required' });
        }
        //user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        res.json({ message: 'Reset token is valid' });
    } catch (error) {
        console.error('Validate reset token error:', error);
        res.status(500).json({ message: 'Failed to validate reset token' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Reset token is required' });
        }

        if (!password) {
            return res.status(400).json({ message: 'New password is required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Failed to reset password. Please try again.' });
    }
};

module.exports = {
    register: exports.register,
    login: exports.login,
    adminLogin: exports.adminLogin,
    getProfile: exports.getProfile,
    updateProfile: exports.updateProfile,
    uploadProfilePicture: exports.uploadProfilePicture,
    getUserProfile: exports.getUserProfile,
    changeOrganization: exports.changeOrganization,
    forgotPassword: exports.forgotPassword,
    validateResetToken: exports.validateResetToken,
    resetPassword: exports.resetPassword
};