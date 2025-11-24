
module.exports = {
  
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/*/Testes/*.test.ts'],
  clearMocks: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coverageDirectory: 'coverage',
  setupFiles: ['<rootDir>/jest.setup.js'],
};