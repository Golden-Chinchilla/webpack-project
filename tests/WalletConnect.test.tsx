import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// 确保环境变量存在（双保险；也可只在 setupTests 设置）
beforeAll(() => {
    process.env.INFURA_KEY = process.env.INFURA_KEY || 'test-key';
});

// ---- Mock ethers（v6）----
// 我们需要：JsonRpcProvider、formatEther、isAddress（可选）
const lookupAddressMock = jest.fn();
const getBalanceMock = jest.fn();

jest.mock('ethers', () => {
    return {
        // v6: 直接从 'ethers' 导入 Provider / utils
        JsonRpcProvider: class {
            url: string;
            constructor(url: string) {
                this.url = url;
            }
            lookupAddress = lookupAddressMock;
            getBalance = getBalanceMock;
        },
        formatEther: (wei: bigint) => (Number(wei) / 1e18).toFixed(4),
        isAddress: (addr: string) => /^0x[0-9a-fA-F]{40}$/.test(addr),
        // 如果组件用了 getAddress，可一并提供
        getAddress: (addr: string) => addr.toLowerCase(),
    };
});

// ---- Wallet 方法 mock（连接/切链/复制等）----
const requestMock = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();

    // @ts-ignore
    window.ethereum.request = requestMock;
    // 默认：连接钱包返回一个账户
    requestMock.mockImplementation(async ({ method, params }) => {
        if (method === 'eth_requestAccounts') return ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'];
        if (method === 'eth_chainId') return '0x1'; // 主网
        if (method === 'wallet_switchEthereumChain') return null;
        return null;
    });

    // ENS / 余额默认
    lookupAddressMock.mockResolvedValue('david.eth');
    getBalanceMock.mockResolvedValue(1234560000000000000n); // 1.23456 ETH
});

// 根据你项目的真实路径改 import
import { WalletConnect } from '../src/WalletConnect.tsx';

describe('<WalletConnect />', () => {
    it('初始渲染：显示“连接钱包”按钮', () => {
        render(<WalletConnect />);
        // 按钮文本如不同，可换成 data-testid: connect-button
        expect(screen.getByRole('button', { name: /连接钱包|connect wallet/i })).toBeInTheDocument();
    });

    it('点击连接后：显示 ENS / 短地址 / 余额', async () => {
        render(<WalletConnect />);

        // 连接
        await userEvent.click(screen.getByRole('button', { name: /连接钱包|connect wallet/i }));

        // 钱包已返回地址 -> ENS 查询 & 余额查询应被调用
        await waitFor(() => {
            expect(lookupAddressMock).toHaveBeenCalledWith('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
            expect(getBalanceMock).toHaveBeenCalled();
        });

        // UI：优先显示 ENS
        expect(await screen.findByText(/david\.eth/i)).toBeInTheDocument();

        // 也可以显示短地址（如果你组件会一起展示）
        // 这里用常见的 0xA0b8...eB48 形式匹配
        const shortAddrRe = /0xA0b8.*eB48/i;
        expect(screen.getByText(shortAddrRe)).toBeInTheDocument();

        // 余额格式化渲染（四舍五入 4 位小数）
        // 1234560000000000000n -> 1.2346
        expect(screen.getByText(/1\.2346\s*ETH/i)).toBeInTheDocument();
    });

    it('当没有 ENS 时，回退显示短地址', async () => {
        lookupAddressMock.mockResolvedValueOnce(null);

        render(<WalletConnect />);
        await userEvent.click(screen.getByRole('button', { name: /连接钱包|connect wallet/i }));

        // 没有 ens，展示短地址
        const shortAddrRe = /0xA0b8.*eB48/i;
        expect(await screen.findByText(shortAddrRe)).toBeInTheDocument();
    });

    it('复制地址：调用 clipboard.writeText 并显示提示', async () => {
        render(<WalletConnect />);
        await userEvent.click(screen.getByRole('button', { name: /连接钱包|connect wallet/i }));

        // 触发复制（如果你是一个“复制”图标，给它加 data-testid="copy-address" 会更稳）
        const copyBtn =
            screen.queryByRole('button', { name: /复制|copy/i }) ||
            screen.getByTestId('copy-address');
        await userEvent.click(copyBtn as HTMLElement);

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
        );

        // 若组件有“已复制”反馈（toast/文本），可断言
        // expect(await screen.findByText(/已复制|copied/i)).toBeInTheDocument();
    });

    it('切换到 Sepolia：调用 wallet_switchEthereumChain', async () => {
        render(<WalletConnect />);
        await userEvent.click(screen.getByRole('button', { name: /连接钱包|connect wallet/i }));

        // 找到“切换网络”按钮（建议给 data-testid="switch-sepolia"）
        const switchBtn =
            screen.queryByRole('button', { name: /sepolia|切换网络/i }) ||
            screen.getByTestId('switch-sepolia');

        await userEvent.click(switchBtn as HTMLElement);

        // 断言切链调用（Sepolia: 0xaa36a7）
        expect(requestMock).toHaveBeenCalledWith({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }],
        });
    });

    it('连接失败/用户拒绝时展示错误提示', async () => {
        requestMock.mockImplementationOnce(async ({ method }) => {
            if (method === 'eth_requestAccounts') {
                const err = new Error('User rejected');
                // @ts-ignore
                err.code = 4001; // 常见的拒绝码
                throw err;
            }
            return null;
        });

        render(<WalletConnect />);

        await userEvent.click(screen.getByRole('button', { name: /连接钱包|connect wallet/i }));

        // 断言错误提示文案（根据你的组件实际提示修改）
        expect(await screen.findByText(/拒绝|rejected|连接失败/i)).toBeInTheDocument();
    });
});
