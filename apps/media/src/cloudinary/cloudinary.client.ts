import { v2 as cloudinary } from 'cloudinary';

export function initCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const secretKey = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !secretKey) {
    throw new Error('Clouidary secrets are missing!!!');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: secretKey,
  });

  return cloudinary;
}
