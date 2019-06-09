import * as React from 'react';
import { RuiButton } from '../Button';
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
  it('should render contained type button', () => {
    const component = renderer
      .create(
        <ThemeProvider>
          <RuiButton variant="contained">Button</RuiButton>
        </ThemeProvider>,
      )
      .toJSON();
    expect(component).toMatchSnapshot();
  });
  it('should render outlined type button', () => {
    const component = renderer
      .create(
        <ThemeProvider>
          <RuiButton variant="outlined">Button</RuiButton>
        </ThemeProvider>,
      )
      .toJSON();
    expect(component).toMatchSnapshot();
  });
  it('should render text type button', () => {
    const component = renderer
      .create(
        <ThemeProvider>
          <RuiButton variant="text">Button</RuiButton>
        </ThemeProvider>,
      )
      .toJSON();
    expect(component).toMatchSnapshot();
  });

  it('should render round type button', () => {
    const component = renderer
      .create(
        <ThemeProvider>
          <RuiButton variant="round">Button</RuiButton>
        </ThemeProvider>,
      )
      .toJSON();
    expect(component).toMatchSnapshot();
  });
});
