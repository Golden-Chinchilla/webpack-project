import { render, screen } from '@testing-library/react';
import { WalletConnect } from '../../src/WalletConnect';

// 最简单的测试，只验证组件能正常渲染
describe('<WalletConnect />', () => {
    it('renders connect button', () => {
        render(<WalletConnect />);
        // 断言有“连接钱包”按钮即可
        expect(
            screen.getByRole('button', { name: /连接钱包|connect wallet/i })
        ).toBeInTheDocument();
    });
});
