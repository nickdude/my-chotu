// Load test environment variables before anything else
require('dotenv').config({ path: '.env.test' });
// Ensure we're never accidentally pointed at production
if (!process.env.DATABASE_URL?.includes('test')) {
  throw new Error('DATABASE_URL must contain "test" to prevent running against production DB');
}
