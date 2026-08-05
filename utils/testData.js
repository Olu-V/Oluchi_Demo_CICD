const crypto = require('crypto');

function generateRandomString(length = 8) {
  return crypto.randomBytes(length).toString('hex').substring(0, length);
}

function generateTestUser() {
  const timestamp = Date.now();
  const random = generateRandomString(6);
  const firstName = process.env.TEST_FIRST_NAME || `Test${timestamp}`;
  const lastName = process.env.TEST_LAST_NAME || `User${timestamp}`;
  const email = process.env.TEST_EMAIL || `test.${timestamp}.${random}@example.com`;
  const phoneNumber = process.env.TEST_PHONE_NUMBER || `080${timestamp.toString().slice(-8)}`;
  const password = process.env.TEST_PASSWORD || `Test@${timestamp}`;

  return {
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
    nin: process.env.TEST_NIN || '',
    bvn: process.env.TEST_BVN || '',
    timestamp,
    random,
  };
}

module.exports = {
  generateRandomString,
  generateTestUser,
};
