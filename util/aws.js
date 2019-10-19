const AWS = require('aws-sdk');
// configuring the AWS environment
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

module.exports = AWS;
