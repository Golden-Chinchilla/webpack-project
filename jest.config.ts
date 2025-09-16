import type { Config } from 'jest';

const config: Config = {
    testEnvironment: 'jsdom',
    transform: { '^.+\\.(t|j)sx?$': '@swc/jest' },
    setupFilesAfterEnv: ['<rootDir>/tests/unit/setupTests.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    testMatch: [
        '**/tests/**/*.(spec|test).(ts|tsx)',
        '**/__tests__/**/*.(spec|test).(ts|tsx)'
    ],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/tests/unit/__mocks__/fileMock.js',
    },
    clearMocks: true,
};
export default config;
