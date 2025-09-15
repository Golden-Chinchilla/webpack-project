import '@testing-library/jest-dom';

// 简易 window.ethereum mock（带 on/off/request）
type EthHandler = (...args: any[]) => void;
const listeners = new Map<string, EthHandler[]>();
process.env.INFURA_KEY = 'test-key';

const ethereumMock = {
    isMetaMask: true,
    on: (event: string, handler: EthHandler) => {
        const arr = listeners.get(event) ?? [];
        arr.push(handler);
        listeners.set(event, arr);
    },
    removeListener: (event: string, handler: EthHandler) => {
        const arr = listeners.get(event) ?? [];
        listeners.set(event, arr.filter((h) => h !== handler));
    },
    request: jest.fn(), // 各用例内按需重写
};

Object.defineProperty(window, 'ethereum', {
    value: ethereumMock,
    writable: false,
});
