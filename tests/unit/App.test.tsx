import { render, screen } from '@testing-library/react';
import App from '../../src/App';

// 只验证 App 页面能渲染标题
describe('<App />', () => {
    it('renders page title', () => {
        render(<App />);
        expect(
            screen.getByRole('heading', { name: /发红包|send red packet/i })
        ).toBeInTheDocument();
    });
});
