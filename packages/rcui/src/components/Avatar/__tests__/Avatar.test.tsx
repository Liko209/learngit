import * as React from 'react';
import * as renderer from 'react-test-renderer';
import { RuiAvatar } from '../Avatar';
import ThemeProvider from '../../../foundation/styles/ThemeProvider';

describe('Avatar', () => {
  // will remove until upgrade material ui
  beforeAll(() => {
    // mock console for jest
    (global as any)['console'] = {
      error: jest.fn(),
    };
  });
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <ThemeProvider>
          <RuiAvatar color="lake">SH</RuiAvatar>
        </ThemeProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('mount correctly', () => {
    expect(() =>
      renderer.create(
        <ThemeProvider>
          <RuiAvatar color="lake">SH</RuiAvatar>
        </ThemeProvider>,
      ),
    ).not.toThrow();
  });
});
