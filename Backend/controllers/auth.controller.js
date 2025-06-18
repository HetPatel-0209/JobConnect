const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const JobSeekerProfile = require('../models/JobSeeker');
const Organization = require('../models/Organizations');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryService');

// Register new user
exports.register = async (req, res) => {
    try {
        const { email, password, role, name, ...profileData } = req.body;

        // Check if role is valid
        if (!['recruiter', 'jobseeker'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
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
                    name: user.name
                }
            });        } catch (err) {
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
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name
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
        // No need to query the database again
        const user = req.user;
        
        // Convert to a plain object and remove the password field
        const userData = user.toObject();
        delete userData.password;
        
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
        session.startTransaction();        try {
            // Update basic user data
            const user = await User.findByIdAndUpdate(
                userId,
                { 
                    name: updateData.name,
                    phone: updateData.phone,
                    location: updateData.location,
                    profileCompleted: true
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
                
                if (!jobseekerProfile) {
                    jobseekerProfile = new JobSeekerProfile({
                        user: userId,
                        skills: updateData.skills || [],
                        experience: updateData.experience || [],
                        education: updateData.education || [],
                        jobPreferences: updateData.jobPreferences || {}
                    });
                } else {
                    // Update existing profile
                    if (updateData.skills) jobseekerProfile.skills = updateData.skills;
                    if (updateData.experience) jobseekerProfile.experience = updateData.experience;
                    if (updateData.education) jobseekerProfile.education = updateData.education;
                    if (updateData.jobPreferences) jobseekerProfile.jobPreferences = updateData.jobPreferences;
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
                // For recruiter, we need to handle organization info
                const orgData = updateData.organization || updateData.company;
                
                if (!orgData || !orgData.gstin) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({ 
                        message: 'Organization information required for recruiter profile' 
                    });
                }
                
                // Find or create organization
                let organization = await Organization.findOne({ gstin: orgData.gstin }).session(session);
                
                if (!organization) {
                    organization = new Organization({
                        gstin: orgData.gstin,
                        name: orgData.name,
                        companySize: orgData.companySize,
                        website: orgData.website,
                        description: orgData.description,
                        contact: orgData.contact || { email: user.email },
                        recruiters: [userId]
                    });
                } else {
                    // Update existing organization if the user is associated with it
                    if (!organization.recruiters.includes(userId)) {
                        organization.recruiters.push(userId);
                    }
                    
                    // Update org fields if provided
                    if (orgData.name) organization.name = orgData.name;
                    if (orgData.companySize) organization.companySize = orgData.companySize;
                    if (orgData.website) organization.website = orgData.website;
                    if (orgData.description) organization.description = orgData.description;
                    if (orgData.contact) organization.contact = orgData.contact;
                }
                
                await organization.save({ session });
                
                // Commit transaction
                await session.commitTransaction();
                session.endSession();
                
                return res.json({
                    message: 'Profile updated successfully',
                    user,
                    organization
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

// Export all controller methods
module.exports = {
    register: exports.register,
    login: exports.login,
    adminLogin: exports.adminLogin,
    getProfile: exports.getProfile,
    updateProfile: exports.updateProfile,
    uploadProfilePicture: exports.uploadProfilePicture
};