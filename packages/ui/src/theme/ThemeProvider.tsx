import React from 'react';
import createMuiTheme, {
  ThemeOptions,
  Theme as MuiTheme,
} from '@material-ui/core/styles/createMuiTheme';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { ThemeProps as StyledThemeProps, ThemeProvider as StyledThemeProvider } from 'styled-components';
import defaultTheme from './config/default';

export interface ThemeProviderProps {
  themeName: string;
  children: React.ReactNode;
}

const createTheme = (options: ThemeOptions) =>
  createMuiTheme(options);

const createThemes = () => {
  const requireContext = require.context('./config', false, /.(ts|js)$/);
  const themePaths = requireContext.keys();

  return themePaths
    .reduce(
      (themes, themePath) => {
        const themeName = themePath.split('.')[1].split('/')[1];
        themes[themeName] = createTheme(requireContext(themePath)[themeName]);
        return themes;
      },
      {},
    );
};

const themes = createThemes();

const ThemeProvider: React.SFC<ThemeProviderProps> = ({ themeName, children }) => {
  const theme = themes[themeName];
  return (
    <StyledThemeProvider theme={theme}>
      <MuiThemeProvider theme={theme}>
        {React.Children.only(children)}
      </MuiThemeProvider>
    </StyledThemeProvider>
  );
};

type Theme = MuiTheme & typeof defaultTheme;
type CustomPalette = typeof defaultTheme.palette;

export {
  Theme,
  CustomPalette,
  ThemeProvider,
};
