const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';
        
        // Determine upload directory based on file type
        if (file.fieldname === 'resume') {
            uploadPath += 'resumes/';
        } else if (file.fieldname === 'logo' || file.fieldname === 'banner') {
            uploadPath += 'organizations/';
        } else if (file.fieldname === 'profilePic') {
            uploadPath += 'profiles/';
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Create unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'resume') {
        // Allow only PDF files for resumes
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed for resumes!'), false);
        }
    } else if (file.fieldname === 'logo' || file.fieldname === 'banner' || file.fieldname === 'profilePic') {
        // Allow only images for logos, banners, and profile pictures
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    } else {
        cb(new Error('Invalid file field!'), false);
    }
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Export middleware functions for different upload scenarios
exports.uploadResume = upload.single('resume');
exports.uploadProfilePic = upload.single('profilePic');
exports.uploadOrganizationFiles = upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]);

// Error handling middleware
exports.handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File is too large. Maximum size is 5MB'
            });
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
