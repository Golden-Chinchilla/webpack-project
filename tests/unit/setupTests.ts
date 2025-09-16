// test/setupTests.ts
import '@testing-library/jest-dom';
import 'dotenv/config';

process.env.INFURA_KEY = process.env.INFURA_KEY || 'test-key';

// 让 TS 认得 window.ethereum
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

// ✅ 关键：为常见方法返回一个 Promise（不要返回 undefined）
const request = jest.fn(async ({ method, params }: any) => {
    switch (method) {
        case 'eth_chainId':
            return '0x1';                  // 初始网络：主网
        case 'eth_accounts':
            return [];                      // 未连接时为空
        case 'eth_requestAccounts':
            return ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48']; // 点击连接后可用
        case 'eth_getBalance':
            return '0x0';                   // 余额给 0 也行
        case 'wallet_switchEthereumChain':
            return null;                    // 切链成功
        default:
            return null;
    }
});

Object.defineProperty(window, 'ethereum', {
    value: {
        isMetaMask: true,
        request,
        on: jest.fn(),
        removeListener: jest.fn(),
    },
    writable: false,
});

// 可选：复制到剪贴板
// @ts-ignore
global.navigator.clipboard = { writeText: jest.fn().mockResolvedValue(undefined) };

// 让全局声明生效
export { };
