const cloudinary = require('cloudinary');

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer to upload
 * @param {Object} options - Upload options
 * @param {string} options.folder - Folder in Cloudinary to upload to
 * @param {string} options.resourceType - Resource type (image, raw, video, etc.)
 * @param {string} options.format - File format (jpg, png, pdf, etc.)
 * @returns {Promise<Object>} - Cloudinary upload result
 */
exports.uploadToCloudinary = async (fileBuffer, options = {}) => {
    const {
        folder = 'profiles',
        resourceType = 'image',
        format = null,
        transformation = []
    } = options;

    return new Promise((resolve, reject) => {
        const uploadOptions = {
            resource_type: resourceType,
            folder,
            use_filename: false,
            unique_filename: true,
        };

        // Add format if specified
        if (format) {
            uploadOptions.format = format;
        }

        // Add transformations if any
        if (transformation && transformation.length > 0) {
            uploadOptions.transformation = transformation;
        }

        cloudinary.v2.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        ).end(fileBuffer);
    });
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @param {string} resourceType - Resource type (image, raw, video, etc.)
 * @returns {Promise<Object>} - Cloudinary deletion result
 */
exports.deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    if (!publicId) return Promise.resolve();

    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.destroy(
            publicId,
            { resource_type: resourceType },
            (error, result) => {
                if (error) {
                    console.warn('Could not delete file from Cloudinary:', error);
                    resolve(); // Continue even if Cloudinary delete fails
                } else {
                    resolve(result);
                }
            }
        );
    });
};