const cloudinary = require('cloudinary');

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