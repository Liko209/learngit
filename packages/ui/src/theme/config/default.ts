// import { Theme } from '../ThemeProvider';
// type DeepPartial<T> = {
//   [P in keyof T]?: T[P] extends (infer U)[]
//   ? DeepPartial<U>[]
//   : T[P] extends ReadonlyArray<infer U>
//   ? ReadonlyArray<DeepPartial<U>>
//   : DeepPartial<T[P]>
// };

const theme = {
  palette: {
    primary: {
      light: '#18a4de',
      main: '#0684bd',
      dark: '#005488',
      900: '#005488',
      800: '#005488',
      700: '#0684bd',
      600: '#0684db',
      500: '#18a4de',
      400: '#34b1e2',
      300: '#54bfe6',
      200: '#82d1ed',
      100: '#b2e3f4',
      50: '#e1f4fb',
    },
    secondary: {
      light: '#ffa424',
      main: '#ff8800',
      dark: '#f36703',
      900: '#ea4b04',
      800: '#f36703',
      700: '#f97802',
      600: '#ff8800',
      500: '#ff9400',
      400: '#ffa424',
      300: '#ffb44c',
      200: '#ffca7f',
      100: '#ffdfb1',
      50: '#fff3e0',
    },
    semantic: {
      negative: '#f44336',
      positive: '#26a304',
      critical: '#f6ad16',
      neutral: '#8c8c8c',
    },
    accent: {
      ash: '#bfbfbf',
      lake: '#69a3eb',
      tiffany: '#22c2d6',
      cateye: '#52d2b1',
      grass: '#bdd655',
      gold: '#edb63c',
      persimmon: '#ff793d',
      tomato: '#ff3737',
    },
    action: {
      hoverOpacity: 0.12,
      active: '#EBF6FA',
    },
  },
  shape: {
    borderRadius: 4,
  },
  spacing: {
    unit: 4,
  },
  zIndex: {
    supernatant: 2,
  },
  size: {
    width: 10,
    height: 10,
  },
  typography: {
    fontSize: 14,
  },
};

export default theme;
