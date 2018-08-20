/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 12:13:16
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import createMuiTheme, { Theme, ThemeOptions } from '@material-ui/core/styles/createMuiTheme';
import MuiThemeProvider, { MuiThemeProviderProps } from '@material-ui/core/styles/MuiThemeProvider';
import { ThemeProvider as StyledThemeProvider } from '../styled-components';

const createTheme = (options: ThemeOptions) =>
  createMuiTheme(options);

const ThemeProvider: React.SFC<MuiThemeProviderProps> = ({ theme, children }) => {
  return (
    <StyledThemeProvider theme={theme}>
      <MuiThemeProvider theme={theme}>
        {React.Children.only(children)}
      </MuiThemeProvider>
    </StyledThemeProvider>
  );
};

export { createTheme, Theme, ThemeOptions, ThemeProvider };
export default ThemeProvider;
