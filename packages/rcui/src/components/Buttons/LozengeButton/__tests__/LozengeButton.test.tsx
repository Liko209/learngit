import * as React from 'react';
import { RuiLozengeButton } from '../';
import ThemeProvider from '../../../../foundation/styles/ThemeProvider';
import * as renderer from 'react-test-renderer';

describe('<Button />', () => {
  // will remove until upgrade material ui
  beforeAll(() => {
    // mock console for jest
    (global as any)['console'] = {
      error: jest.fn(),
    };
  });
  it('should render with loading', () => {
    const component = renderer
      .create(
        <ThemeProvider>
          <RuiLozengeButton loading={true}>Button</RuiLozengeButton>
        </ThemeProvider>,
      )
      .toJSON();
    expect(component).toMatchSnapshot();
  });
  it('should render without loading', () => {
    const component = renderer
      .create(
        <ThemeProvider>
          <RuiLozengeButton loading={false}>Button</RuiLozengeButton>
        </ThemeProvider>,
      )
      .toJSON();
    expect(component).toMatchSnapshot();
  });
  it('should render with arrow', () => {
    const component = renderer
      .create(
        <ThemeProvider>
          <RuiLozengeButton>Button</RuiLozengeButton>
        </ThemeProvider>,
      )
      .toJSON();
    expect(component).toMatchSnapshot();
  });
});
