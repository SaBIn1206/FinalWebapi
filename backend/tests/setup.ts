export default async function setup() {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  process.env.DATABASE_URL = 'mongodb://localhost:27017/bakeryhub_test';
  process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
}
