const multer = require('multer');
const path = require('path');
const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'resume') {
        if (file.mimetype === 'application/pdf' || 
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.mimetype === 'application/msword') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, and DOCX files are allowed for resumes!'), false);
        }
    } else if (file.fieldname === 'profilePic') {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, JPEG, and PNG files are allowed for profile pictures!'), false);
        }    } else if (file.fieldname === 'logo' || file.fieldname === 'banner') {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, JPEG, and PNG files are allowed for organization images!'), false);
        }
    } else {
        cb(new Error('Invalid file field!'), false);
    }
};

const resumeUpload = multer({
    storage: memoryStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

exports.uploadResume = resumeUpload.single('resume');
exports.uploadProfilePic = multer({
    storage: memoryStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
}).single('profilePic');
exports.uploadOrganizationFiles = multer({
    storage: memoryStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
}).fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]);

exports.handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
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