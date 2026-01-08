import {
  generateSignatureCallback,
  getUploadWidgetOptions,
} from '@cloudinary-util/url-loader'

export const getCloudinaryUploadOptions = (signatureEndpoint: string) => {
  const cloudinaryConfig = {
    cloud: {
      apiKey : import.meta.env.VITE_CLOUDINARY_API_KEY as string,
      cloudName : import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string,
    },
    url: {}
  }
  const uploadSignature = signatureEndpoint && generateSignatureCallback({
    signatureEndpoint: String(signatureEndpoint),
    fetch
  });

  return getUploadWidgetOptions({
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    uploadSignature,
  }, cloudinaryConfig);
}