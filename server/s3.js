const AWS = require('aws-sdk');

// Set up AWS S3
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-south-1', // Use your AWS region
});
const s3 = new AWS.S3();

module.exports = s3;
