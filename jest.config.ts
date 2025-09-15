import type { Config } from 'jest';

const config: Config = {
    testEnvironment: 'jsdom',
    transform: { '^.+\\.(t|j)sx?$': '@swc/jest' },
    setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    testMatch: ['**/__tests__/**/*.(spec|test).(ts|tsx)'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/test/__mocks__/fileMock.js',
    },
    clearMocks: true,
};
export default config;
