const required = (key) => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env variable: ${key}`);
  return val;
};

const optional = (key, fallback) => process.env[key] ?? fallback;

const config = {
  nodeEnv: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '4000'), 10),
  isDev: optional('NODE_ENV', 'development') === 'development',

  db: {
    url: required('DATABASE_URL'),
  },

  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: optional('JWT_EXPIRES_IN', '7d'),
    refreshExpiresIn: optional('JWT_REFRESH_EXPIRES_IN', '30d'),
  },

  otp: {
    expiresMinutes: parseInt(optional('OTP_EXPIRES_MINUTES', '10'), 10),
    length: parseInt(optional('OTP_LENGTH', '6'), 10),
    maxAttempts: 5,
  },

  cors: {
    origin: optional('FRONTEND_URL', 'http://localhost:3000'),
  },

  s3: {
    bucket:    optional('S3_BUCKET', ''),
    region:    optional('S3_REGION', ''),
    accessKey: optional('S3_ACCESS_KEY', ''),
    secretKey: optional('S3_SECRET_KEY', ''),
    endpoint:  optional('S3_ENDPOINT', ''),
  },

  whatsapp: {
    apiUrl:        optional('WHATSAPP_API_URL', ''),
    accessToken:   optional('WHATSAPP_ACCESS_TOKEN', ''),
    phoneNumberId: optional('WHATSAPP_PHONE_NUMBER_ID', ''),
  },
};

module.exports = config;
