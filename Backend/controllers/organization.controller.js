const Organization = require('../models/Organizations');
const { fetchGSTData, validateGSTFormat } = require('../utils/gstService');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryService');

/**
 * Fetch organization data by GST number
 */
exports.fetchOrganizationByGST = async (req, res) => {
    try {
        const { gstNumber } = req.params;

        // Validate GST number format
        if (!validateGSTFormat(gstNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid GST number format. GST number should be 15 characters long.'
            });
        }

        // Check if organization already exists in our database
        const existingOrg = await Organization.findOne({ gstin: gstNumber });
        if (existingOrg) {
            return res.json({
                success: true,
                message: 'Organization found in database',
                data: existingOrg,
                source: 'database'
            });
        }

        // Fetch from GST API
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

/**
 * Create or register a new organization
 */
exports.createOrganization = async (req, res) => {
    try {
        const { gstin, autoFetch = true } = req.body;

        // Validate required fields
        if (!gstin) {
            return res.status(400).json({
                success: false,
                message: 'GST number is required'
            });
        }

        // Validate GST number format
        if (!validateGSTFormat(gstin)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid GST number format'
            });
        }

        // Check if organization already exists
        const existingOrg = await Organization.findOne({ gstin });
        if (existingOrg) {
            return res.status(409).json({
                success: false,
                message: 'Organization with this GST number already exists',
                data: existingOrg
            });
        }

        let organizationData = { gstin };

        // Auto-fetch data from GST API if requested
        if (autoFetch) {
            try {
                const gstResult = await fetchGSTData(gstin);
                if (gstResult.success) {
                    organizationData = {
                        gstin: gstResult.data.gstin,
                        name: gstResult.data.name,
                        contact: {
                            email: req.body.email || '', // Email needs to be provided by user
                            address: gstResult.data.address
                        },
                        description: {
                            about: `${gstResult.data.businessType} business established on ${gstResult.data.registrationDate}`
                        },
                        // Merge with any additional data provided in request body
                        ...req.body
                    };
                }
            } catch (gstError) {
                console.warn('GST API fetch failed, creating with provided data:', gstError.message);
                // Continue with manual data entry
                organizationData = { ...req.body, gstin };
            }
        } else {
            // Use only provided data
            organizationData = { ...req.body, gstin };
        }

        // Ensure required fields are present
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

        // Create organization
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

/**
 * Get organization by ID
 */
exports.getOrganization = async (req, res) => {
    try {
        const { orgId } = req.params;
        
        const organization = await Organization.findById(orgId)
            .populate('recruiters', 'name email phone');

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        res.json({
            success: true,
            data: organization
        });

    } catch (error) {
        console.error('Get organization error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch organization'
        });
    }
};

/**
 * Update organization
 */
exports.updateOrganization = async (req, res) => {
    try {
        const { orgId } = req.params;
        const updates = req.body;

        // Don't allow updating GST number
        delete updates.gstin;
        
        // Don't allow updating logo and banner via this endpoint
        // These should be updated using the dedicated uploadOrganizationImages endpoint
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

/**
 * Get all organizations (with pagination)
 */
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
            .select('gstin name companySize contact.address.city contact.address.state createdAt')
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

/**
 * Upload organization logo and/or banner
 */
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
        
        // Check if user is authorized to upload images
        // Ensure the user is a recruiter for this organization
        const currentUserId = req.user._id;
        if (!organization.recruiters.includes(currentUserId)) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this organization'
            });
        }
        
        // Check if files were uploaded
        if (!req.files || (Object.keys(req.files).length === 0)) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }
        
        const updates = {};
        
        // Handle logo upload
        if (req.files.logo && req.files.logo.length > 0) {
            // Delete old logo if exists
            if (organization.logoPublicId) {
                await deleteFromCloudinary(organization.logoPublicId);
            }
            
            // Upload new logo to Cloudinary
            const logoFile = req.files.logo[0];
            const logoFormat = logoFile.mimetype.split('/')[1]; // Extract format from mimetype
            
            const logoResult = await uploadToCloudinary(logoFile.buffer, {
                folder: 'organizations/logos',
                resourceType: 'image',
                format: logoFormat,
                transformation: [
                    { width: 800, height: 800, crop: 'limit' }, // Resize for optimization
                    { quality: 'auto:good' } // Optimize quality
                ]
            });
            
            updates.logo = logoResult.secure_url;
            updates.logoPublicId = logoResult.public_id;
        }
        
        // Handle banner upload
        if (req.files.banner && req.files.banner.length > 0) {
            // Delete old banner if exists
            if (organization.bannerPublicId) {
                await deleteFromCloudinary(organization.bannerPublicId);
            }
            
            // Upload new banner to Cloudinary
            const bannerFile = req.files.banner[0];
            const bannerFormat = bannerFile.mimetype.split('/')[1]; // Extract format from mimetype
            
            const bannerResult = await uploadToCloudinary(bannerFile.buffer, {
                folder: 'organizations/banners',
                resourceType: 'image',
                format: bannerFormat,
                transformation: [
                    { width: 1600, height: 500, crop: 'limit' }, // Banner dimensions
                    { quality: 'auto:good' } // Optimize quality
                ]
            });
            
            updates.banner = bannerResult.secure_url;
            updates.bannerPublicId = bannerResult.public_id;
        }
        
        // Update organization with new image URLs
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