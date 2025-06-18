const multer = require('multer');
const path = require('path');

// For all uploads, we use memory storage since we'll upload to Cloudinary
const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'resume') {
        if (file.mimetype === 'application/pdf' || 
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and DOCX files are allowed for resumes!'), false);
        }
    } else if (file.fieldname === 'profilePic') {
        // Allow only jpg, jpeg, and png for profile pictures
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, JPEG, and PNG files are allowed for profile pictures!'), false);
        }    } else if (file.fieldname === 'logo' || file.fieldname === 'banner') {
        // Allow only jpg, jpeg, and png for organization images
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, JPEG, and PNG files are allowed for organization images!'), false);
        }
    } else {
        cb(new Error('Invalid file field!'), false);
    }
};

// For resume uploads
const resumeUpload = multer({
    storage: memoryStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// For other file uploads
const otherUploads = multer({
    storage: memoryStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

exports.uploadResume = resumeUpload.single('resume');
exports.uploadProfilePic = multer({
    storage: memoryStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
}).single('profilePic');
exports.uploadOrganizationFiles = multer({
    storage: memoryStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit for organization images
    }
}).fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]);

exports.handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            // Check which file field triggered the error to provide the correct message
            if (req.route && req.route.path === '/auth/profile-picture') {
                return res.status(400).json({
                    message: 'Profile picture is too large. Maximum size is 10MB'
                });
            } else if (req.route && req.route.path.includes('/organization')) {
                return res.status(400).json({
                    message: 'Organization image is too large. Maximum size is 10MB'
                });
            } else {
                return res.status(400).json({
                    message: 'File is too large. Maximum size is 5MB'
                });
            }
        }
        return res.status(400).json({
            message: 'File upload error: ' + err.message
        });
    }
    
    if (err) {
        return res.status(400).json({
            message: err.message
        });
    }
    
    next();
};