import React from 'react';
import createMuiTheme, { ThemeOptions } from '@material-ui/core/styles/createMuiTheme';
import MuiThemeProvider, { MuiThemeProviderProps } from '@material-ui/core/styles/MuiThemeProvider';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

export const createTheme = (options: ThemeOptions) =>
  createMuiTheme(options);

export const ThemeProvider: React.SFC<MuiThemeProviderProps> = ({ theme, children }) => {
  return (
    <StyledThemeProvider theme={theme}>
      <MuiThemeProvider theme={theme}>
        {React.Children.only(children)}
      </MuiThemeProvider>
    </StyledThemeProvider>
  );
};
