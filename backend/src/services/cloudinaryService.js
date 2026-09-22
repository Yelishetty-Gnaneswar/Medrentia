import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if keys exist
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  !process.env.CLOUDINARY_API_KEY.includes('123456789')
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Upload buffer to Cloudinary or fallback
 * @param {Buffer} fileBuffer
 * @param {string} folder
 * @returns {Promise<string>} Image URL
 */
export const uploadImageToCloudinary = async (fileBuffer, folder = 'medrentia/equipment', mimetype = 'image/jpeg') => {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    !process.env.CLOUDINARY_API_KEY.includes('123456789')
  ) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  // Preserve uploaded image buffer as Data URI in local/development environment
  const base64Data = fileBuffer.toString('base64');
  return `data:${mimetype || 'image/jpeg'};base64,${base64Data}`;
};
