module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  modulePaths: ['<rootDir>'],
  globalSetup: '<rootDir>/test/test-container/global-setup.ts',
  setupFilesAfterEnv: ['<rootDir>/test/pre-setup.ts'],
  globalTeardown: '<rootDir>/test/test-container/global-teardown.ts',
  maxWorkers: 1,
  testTimeout: 30_000,
};
// module.exports = {
//   projects: [
//     {
//       // 통합테스트 설정
//       displayName: 'integration',
//       testMatch: ['<rootDir>/test/**/*.integration.spec.ts'],

//       globalSetup: '<rootDir>/test/test-container/global-setup.ts',
//       globalTeardown: '<rootDir>/test/test-container/global-teardown.ts',
//       setupFilesAfterEnv: ['<rootDir>/test/pre-setup.ts'],
//     },
//     {
//       // 단위 테스트 설정
//       displayName: 'unit',
//       testMatch: [
//         '<rootDir>/test/**/*.spec.ts',
//         '!<rootDir>/test/**/*.integration.spec.ts',
//       ],
//     },
//   ],

//   // 공통 설정
//   moduleFileExtensions: ['js', 'json', 'ts'],
//   rootDir: '.',
//   testRegex: '.*\\.spec\\.ts$',
//   transform: {
//     '^.+\\.(t|j)s$': 'ts-jest',
//   },
//   collectCoverageFrom: ['**/*.(t|j)s'],
//   coverageDirectory: '../coverage',
//   testEnvironment: 'node',
//   moduleNameMapper: {
//     '^src/(.*)$': '<rootDir>/src/$1',
//   },
//   modulePaths: ['<rootDir>'],
//   maxWorkers: 1,
//   testTimeout: 30_000,
// };
