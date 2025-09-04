const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Initialize AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// Upload file to S3
const uploadToS3 = async (file, fileName) => {
  try {
    console.log('Starting S3 upload for file:', fileName);
    
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: `resources/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // Make file publicly accessible
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);
    
    // Return public URL
    const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/resources/${fileName}`;
    console.log('File uploaded successfully, URL:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};

// Generate signed URL for private files (if needed)
const getSignedUrlForFile = async (fileName, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `resources/${fileName}`,
    });
    
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
};

module.exports = {
  s3Client,
  uploadToS3,
  getSignedUrlForFile,
  BUCKET_NAME
};
