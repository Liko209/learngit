import * as React from 'react';
import * as renderer from 'react-test-renderer';
import { RuiAvatar } from '../Avatar';
import { ThemeProvider } from '../../../foundation/styles';

describe('Avatar', () => {
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
