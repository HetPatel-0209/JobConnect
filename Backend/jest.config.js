/**
 * Jest configuration for JobConnect Backend tests
 */

module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middlewares/**/*.js',
    'utils/**/*.js',
    'models/**/*.js',
    '!**/*.test.js',
    '!**/*.spec.js'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 30000,
  setupFiles: ['<rootDir>/tests/jest.setup.js']
};
