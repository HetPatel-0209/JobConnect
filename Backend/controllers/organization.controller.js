const Organization = require('../models/Organizations');
const { fetchGSTData, validateGSTFormat } = require('../utils/gstService');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryService');

// organization data by gst number
exports.fetchOrganizationByGST = async (req, res) => {
    try {
        const { gstNumber } = req.params;
        if (!validateGSTFormat(gstNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid GST number format. GST number should be 15 characters long.'
            });
        }

        const existingOrg = await Organization.findOne({ gstin: gstNumber });
        if (existingOrg) {
            return res.json({
                success: true,
                message: 'Organization found in database',
                data: existingOrg,
                source: 'database'
            });
        }

        const gstResult = await fetchGSTData(gstNumber);

        if (!gstResult.success) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found in GST records'
            });
        }

        res.json({
            success: true,
            message: 'Organization data fetched successfully',
            data: gstResult.data,
            source: 'gst_api'
        });

    } catch (error) {
        console.error('Fetch organization error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch organization data'
        });
    }
};

// new organization
exports.createOrganization = async (req, res) => {
    try {
        const { gstin, autoFetch = true } = req.body;
        if (!gstin) {
            return res.status(400).json({
                success: false,
                message: 'GST number is required'
            });
        }
        if (!validateGSTFormat(gstin)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid GST number format'
            });
        }

        const existingOrg = await Organization.findOne({ gstin });
        if (existingOrg) {
            return res.status(409).json({
                success: false,
                message: 'Organization with this GST number already exists',
                data: existingOrg
            });
        }

        let organizationData = { gstin };
        if (autoFetch) {
            try {
                const gstResult = await fetchGSTData(gstin);
                if (gstResult.success) {
                    organizationData = {
                        gstin: gstResult.data.gstin,
                        name: gstResult.data.name,
                        contact: {
                            email: req.body.email || '',
                            address: gstResult.data.address
                        },
                        description: {
                            about: `${gstResult.data.businessType} business established on ${gstResult.data.registrationDate}`
                        },
                        ...req.body
                    };
                }
            } 
            catch (gstError) {
                console.warn('GST API fetch failed, creating with provided data:', gstError.message);
                organizationData = { ...req.body, gstin };
            }
        } 
        else {
            organizationData = { ...req.body, gstin };
        }
        if (!organizationData.name) {
            return res.status(400).json({
                success: false,
                message: 'Organization name is required'
            });
        }

        if (!organizationData.contact?.email) {
            return res.status(400).json({
                success: false,
                message: 'Contact email is required'
            });
        }

        const organization = new Organization(organizationData);
        await organization.save();

        res.status(201).json({
            success: true,
            message: 'Organization created successfully',
            data: organization
        });

    } catch (error) {
        console.error('Create organization error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create organization'
        });
    }
};

// organization by ID
exports.getOrganization = async (req, res) => {
    try {
        const { orgId } = req.params;

        const organization = await Organization.findById(orgId);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        const recruiters = await require('../models/Recruiter').find({ organizationId: orgId })
            .populate('user', 'name email phone profilePic')
            .select('user title department');

        res.json({
            success: true,
            data: {
                ...organization.toObject(),
                recruiters: recruiters.map(recruiter => ({
                    ...recruiter.user.toObject(),
                    title: recruiter.title,
                    department: recruiter.department
                }))
            }
        });

    } catch (error) {
        console.error('Get organization error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch organization'
        });
    }
};

exports.updateOrganization = async (req, res) => {
    try {
        const { orgId } = req.params;
        const updates = req.body;

        delete updates.gstin;
        delete updates.logo;
        delete updates.logoPublicId;
        delete updates.banner;
        delete updates.bannerPublicId;

        const organization = await Organization.findByIdAndUpdate(
            orgId,
            updates,
            { new: true, runValidators: true }
        );

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        res.json({
            success: true,
            message: 'Organization updated successfully',
            data: organization
        });

    } catch (error) {
        console.error('Update organization error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update organization'
        });
    }
};

// all organizations (with pagination)
exports.getAllOrganizations = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        
        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { gstin: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const skip = (page - 1) * limit;
        
        const organizations = await Organization.find(query)
            .select('gstin name companySize contact.address.city contact.address.state createdAt logo')
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit));

        const total = await Organization.countDocuments(query);

        res.json({
            success: true,
            data: organizations,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalOrganizations: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get organizations error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch organizations'
        });
    }
};

// organization logo and banner
exports.uploadOrganizationImages = async (req, res) => {
    try {
        const { orgId } = req.params;
        
        // Check if organization exists
        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        const currentUserId = req.user._id;
        const recruiterProfile = await require('../models/Recruiter').findOne({
            user: currentUserId,
            organizationId: orgId
        });

        if (!recruiterProfile) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this organization'
            });
        }
        
        // if files were uploaded
        if (!req.files || (Object.keys(req.files).length === 0)) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }
        
        const updates = {};
        if (req.files.logo && req.files.logo.length > 0) {
            if (organization.logoPublicId) {
                await deleteFromCloudinary(organization.logoPublicId);
            }
            
            const logoFile = req.files.logo[0];
            const logoFormat = logoFile.mimetype.split('/')[1];
            
            const logoResult = await uploadToCloudinary(logoFile.buffer, {
                folder: 'organizations/logos',
                resourceType: 'image',
                format: logoFormat,
                transformation: [
                    { width: 800, height: 800, crop: 'limit' },
                    { quality: 'auto:good' }
                ]
            });
            
            updates.logo = logoResult.secure_url;
            updates.logoPublicId = logoResult.public_id;
        }
        
        if (req.files.banner && req.files.banner.length > 0) {
            if (organization.bannerPublicId) {
                await deleteFromCloudinary(organization.bannerPublicId);
            }
            
            // Upload new banner to Cloudinary
            const bannerFile = req.files.banner[0];
            const bannerFormat = bannerFile.mimetype.split('/')[1];
            
            const bannerResult = await uploadToCloudinary(bannerFile.buffer, {
                folder: 'organizations/banners',
                resourceType: 'image',
                format: bannerFormat,
                transformation: [
                    { width: 1600, height: 500, crop: 'limit' },
                    { quality: 'auto:good' }
                ]
            });
            
            updates.banner = bannerResult.secure_url;
            updates.bannerPublicId = bannerResult.public_id;
        }
        
        // new image URLs
        const updatedOrganization = await Organization.findByIdAndUpdate(
            orgId,
            updates,
            { new: true }
        );
        
        res.json({
            success: true,
            message: 'Organization images uploaded successfully',
            data: updatedOrganization
        });
        
    } catch (error) {
        console.error('Upload organization images error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload organization images'
        });
    }
};