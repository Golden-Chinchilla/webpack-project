// test/setupTests.ts
import '@testing-library/jest-dom';

// —— 为 TypeScript 声明 window.ethereum（避免 TS 报错）——
declare global {
    interface Window {
        ethereum: {
            isMetaMask?: boolean;
            request: jest.Mock<any, any>;
            on: jest.Mock<any, any>;
            removeListener: jest.Mock<any, any>;
        };
    }
}

// —— 提供一个最小可用的 mock（按你的 App 需求可以扩）——
const requestMock = jest.fn();

// 常见钱包方法默认返回：
// - 连接账户
// - 主网 chainId
// 你可以根据 App.tsx 的真实逻辑再补充
requestMock.mockImplementation(async ({ method }) => {
    if (method === 'eth_requestAccounts') return ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'];
    if (method === 'eth_chainId') return '0x1'; // Ethereum Mainnet
    return null;
});

Object.defineProperty(window, 'ethereum', {
    value: {
        isMetaMask: true,
        request: requestMock,
        on: jest.fn(),
        removeListener: jest.fn(),
    },
    writable: false,
});
