import React from 'react';
import createMuiTheme, {
  ThemeOptions,
  Theme as MuiTheme,
} from '@material-ui/core/styles/createMuiTheme';
import { Palette as MuiPalette } from '@material-ui/core/styles/createPalette';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

export interface ThemeProviderProps {
  themeName: string;
  children: React.ReactNode;
}

const createTheme = (options: ThemeOptions) =>
  createMuiTheme(options);

const createThemes = () => {
  const requireContext = require.context('./config', false, /.ts$/);
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

type Theme = MuiTheme & {
  palette: MuiPalette & {
    primary: {
      900: string;
      800: string;
      700: string;
      600: string;
      500: string;
      400: string;
      300: string;
      200: string;
      100: string;
      50: string;
    },
    secondary: {
      900: string;
      800: string;
      700: string;
      600: string;
      500: string;
      400: string;
      300: string;
      200: string;
      100: string;
      50: string;
    };
    semantic: {
      negative: string;
      positive: string;
      critical: string;
      neutral: string;
    },
    accent: {
      ash: string;
      lake: string;
      tiffany: string;
      cateye: string;
      grass: string;
      gold: string;
      persimmon: string;
      tomato: string;
    };
  };
};

export {
  Theme,
  ThemeProvider,
};
