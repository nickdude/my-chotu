module.exports = {
  testEnvironment: 'node',
  testMatch:       ['**/tests/**/*.test.js'],
  setupFiles:      ['<rootDir>/tests/setup.js'],
  testTimeout:     30000,
  // Run tests serially — they share a DB and must not interleave
  maxWorkers:      1,
  clearMocks:      true,
};
