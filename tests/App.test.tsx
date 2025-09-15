import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// 1) mock WalletConnect（避免 INFURA_KEY 运行期报错）
jest.mock('../WalletConnect.tsx', () => ({
    WalletConnect: () => <div data-testid="wallet-connect">Wallet</div>,
}));

// 2) mock ethers：parseEther、BrowserProvider、Contract
const createRedPacketMock = jest.fn();
const claimMock = jest.fn();

const contractOnMock = jest.fn();
const txWaitMock = jest.fn().mockResolvedValue({});

jest.mock('ethers', () => {
    // 用最小实现模拟 ethers
    return {
        // parseEther：直接返回一个可断言的 BigInt
        parseEther: (v: string) => {
            // 简单把 "0.1" -> 100000000000000000n，够测试用
            if (v.includes('.')) {
                const [a, b] = v.split('.');
                const padded = (b + '000000000000000000').slice(0, 18);
                return BigInt(a + padded);
            }
            return BigInt(v + '000000000000000000');
        },

        // BrowserProvider / getSigner：按需返回假的 signer
        BrowserProvider: class {
            constructor(_eth: any) { }
            getSigner = async () => ({ address: '0xSigner' });
        },

        // Contract：带 on/createRedPacket/claim
        Contract: class {
            address: string;
            abi: any;
            signer: any;
            constructor(addr: string, abi: any, signer: any) {
                this.address = addr;
                this.abi = abi;
                this.signer = signer;
            }
            on = contractOnMock;
            createRedPacket = createRedPacketMock.mockResolvedValue({
                wait: txWaitMock,
            });
            claim = claimMock.mockResolvedValue({
                wait: txWaitMock,
            });
        },

        // 其余导出避免 undefined
        formatEther: (bn: bigint) => (Number(bn) / 1e18).toString(),
    };
});

import App from '../App';

function fillAndClickCreate = async (amount: string, shares: string, expireAt: string) => {
    const sendBox = screen.getByRole('heading', { name: '发红包' }).closest('div')!;
    await userEvent.clear(within(sendBox).getByPlaceholderText('金额(ETH)'));
    await userEvent.type(within(sendBox).getByPlaceholderText('金额(ETH)'), amount);
    await userEvent.clear(within(sendBox).getByPlaceholderText('份数'));
    await userEvent.type(within(sendBox).getByPlaceholderText('份数'), shares);
    await userEvent.clear(within(sendBox).getByPlaceholderText('过期时间戳'));
    await userEvent.type(within(sendBox).getByPlaceholderText('过期时间戳'), expireAt);
    await userEvent.click(within(sendBox).getByRole('button', { name: '发红包' }));
};

function fillAndClickClaim = async (id: string) => {
    const claimBox = screen.getByRole('heading', { name: '抢红包' }).closest('div')!;
    await userEvent.clear(within(claimBox).getByPlaceholderText('红包ID'));
    await userEvent.type(within(claimBox).getByPlaceholderText('红包ID'), id);
    await userEvent.click(within(claimBox).getByRole('button', { name: '抢红包' }));
};

describe('<App />', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // window.ethereum.request 在 setupTests 里已存在；这里给出默认分支
        (window.ethereum.request as jest.Mock).mockResolvedValue(undefined);
    });

    it('初始化时渲染 WalletConnect，并注册合约事件监听', async () => {
        render(<App />);
        expect(await screen.findByTestId('wallet-connect')).toBeInTheDocument();
        // initContract 会对合约注册事件
        expect(contractOnMock).toHaveBeenCalledWith('RedPacketCreated', expect.any(Function));
        expect(contractOnMock).toHaveBeenCalledWith('RedPacketClaimed', expect.any(Function));
        expect(contractOnMock).toHaveBeenCalledWith('RedPacketExhausted', expect.any(Function));
    });

    it('发红包成功后显示成功提示，并以正确参数调用 createRedPacket', async () => {
        render(<App />);

        await fillAndClickCreate('0.1', '3', '1700000000');

        // 检查参数：份数 / 过期时间戳 / value（wei）
        expect(createRedPacketMock).toHaveBeenCalledWith(
            3,
            1700000000,
            expect.objectContaining({ value: 100000000000000000n }) // 0.1 ETH
        );

        // wait resolve 后的提示
        expect(await screen.findByText('✅ 发红包交易成功')).toBeInTheDocument();
    });

    it('发红包失败时显示错误信息', async () => {
        (createRedPacketMock as jest.Mock).mockRejectedValueOnce(new Error('boom'));
        render(<App />);

        await fillAndClickCreate('0.2', '2', '1700000001');

        expect(await screen.findByText(/❌ 发红包失败: boom/)).toBeInTheDocument();
    });

    it('抢红包成功后提示“已提交”', async () => {
        render(<App />);

        await fillAndClickClaim('42');

        expect(claimMock).toHaveBeenCalledWith(42);
        expect(await screen.findByText('✅ 抢红包交易已提交')).toBeInTheDocument();
    });

    it('抢红包异常分支：AlreadyClaimed / SoldOut / Expired / 其他', async () => {
        const scenarios = [
            { err: { errorName: 'AlreadyClaimed' }, msg: '⚠️ 你已经抢过了' },
            { err: { errorName: 'SoldOut' }, msg: '⚠️ 红包抢完了' },
            { err: { errorName: 'Expired' }, msg: '⚠️ 红包已过期' },
            { err: new Error('weird'), msg: '❌ 抢红包失败: weird' },
        ];

        for (const s of scenarios) {
            (claimMock as jest.Mock).mockRejectedValueOnce(s.err);
            render(<App />);
            await fillAndClickClaim('7');
            expect(await screen.findByText(s.msg)).toBeInTheDocument();
        }
    });
});
