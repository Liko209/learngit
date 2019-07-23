/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-09 16:43:46
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { mount } from 'enzyme';
import { ThemeProvider } from 'styled-components';
import { createMuiTheme } from '@material-ui/core/styles';

const rawTheme = {
  breakpoints: {
    keys: ['xs', 'sm', 'md', 'lg', 'xl'],
    values: { xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920 }
  },
  direction: 'ltr',
  mixins: {
    toolbar: {
      minHeight: 56,
      '@media (min-width:0px) and (orientation: landscape)': {
        minHeight: 48
      },
      '@media (min-width:600px)': { minHeight: 64 }
    }
  },
  overrides: {},
  palette: {
    getContrastText: () => '',
    common: { black: '#000', white: '#fff' },
    type: 'light',
    primary: {
      50: '#e1f4fb',
      100: '#b2e3f4',
      200: '#82d1ed',
      300: '#54bfe6',
      400: '#34b1e2',
      500: '#18a4de',
      600: '#0684db',
      700: '#0684bd',
      800: '#005488',
      900: '#005488',
      light: '#18a4de',
      main: '#0684bd',
      dark: '#005488',
      contrastText: '#fff'
    },
    secondary: {
      50: '#fff3e0',
      100: '#ffdfb1',
      200: '#ffca7f',
      300: '#ffb44c',
      400: '#ffa424',
      500: '#ff9400',
      600: '#ff8800',
      700: '#f97802',
      800: '#f36703',
      900: '#ea4b04',
      light: '#ffa424',
      main: '#ff8800',
      dark: '#f36703',
      contrastText: 'rgba(0, 0, 0, 0.87)'
    },
    error: {
      light: '#e57373',
      main: '#f44336',
      dark: '#d32f2f',
      contrastText: '#fff'
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      A100: '#d5d5d5',
      A200: '#aaaaaa',
      A400: '#303030',
      A700: '#616161'
    },
    contrastThreshold: 3,
    tonalOffset: 0.2,
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.54)',
      disabled: 'rgba(0, 0, 0, 0.38)',
      hint: 'rgba(0, 0, 0, 0.38)'
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    background: {
      paper: '#fff',
      default: '#fafafa',
      disabled: 'rgba(255,55,55,.05)'
    },
    action: {
      active: '#EBF6FA',
      hover: 'rgba(0, 0, 0, 0.08)',
      hoverOpacity: 0.12,
      selected: 'rgba(0, 0, 0, 0.14)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)'
    },
    semantic: {
      negative: '#f44336',
      positive: '#26a304',
      critical: '#f6ad16',
      neutral: '#616161'
    },
    accent: {
      ash: '#bfbfbf',
      lake: '#69a3eb',
      tiffany: '#22c2d6',
      cateye: '#52d2b1',
      grass: '#bdd655',
      olive: '#4cd964',
      gold: '#edb63c',
      lemon: '#ffd800',
      tomato: '#ff3737',
      indigo: '#4a1e8c',
      purple: '#ea80fc',
      persimmon: '#ff793d'
    },
    tooltip: { dark: '#616161' },
    avatar: {
      tomato: '#F95B5C',
      blueberry: '#6E6EC0',
      oasis: '#5E95C8',
      gold: '#FFBF2A',
      sage: '#7EB57F',
      ash: '#666666',
      persimmon: '#FF8800',
      pear: '#5FB95C',
      brass: '#CC9922',
      lake: '#6FAFEB'
    }
  },
  props: {},
  shadows: [
    'none',
    '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.12), 0 0 2px 0 rgba(0, 0, 0, 0.14);',
    '0px 1px 5px 0px rgba(0, 0, 0, 0.2),0px 2px 2px 0px rgba(0, 0, 0, 0.14),0px 3px 1px -2px rgba(0, 0, 0, 0.12)',
    '0px 1px 8px 0px rgba(0, 0, 0, 0.2),0px 3px 4px 0px rgba(0, 0, 0, 0.14),0px 3px 3px -2px rgba(0, 0, 0, 0.12)',
    '0px 2px 4px -1px rgba(0, 0, 0, 0.2),0px 4px 5px 0px rgba(0, 0, 0, 0.14),0px 1px 10px 0px rgba(0, 0, 0, 0.12)',
    '0px 3px 5px -1px rgba(0, 0, 0, 0.2),0px 5px 8px 0px rgba(0, 0, 0, 0.14),0px 1px 14px 0px rgba(0, 0, 0, 0.12)',
    '0px 3px 5px -1px rgba(0, 0, 0, 0.2),0px 6px 10px 0px rgba(0, 0, 0, 0.14),0px 1px 18px 0px rgba(0, 0, 0, 0.12)',
    '0px 4px 5px -2px rgba(0, 0, 0, 0.2),0px 7px 10px 1px rgba(0, 0, 0, 0.14),0px 2px 16px 1px rgba(0, 0, 0, 0.12)',
    '0px 5px 5px -3px rgba(0, 0, 0, 0.2),0px 8px 10px 1px rgba(0, 0, 0, 0.14),0px 3px 14px 2px rgba(0, 0, 0, 0.12)',
    '0px 5px 6px -3px rgba(0, 0, 0, 0.2),0px 9px 12px 1px rgba(0, 0, 0, 0.14),0px 3px 16px 2px rgba(0, 0, 0, 0.12)',
    '0px 6px 6px -3px rgba(0, 0, 0, 0.2),0px 10px 14px 1px rgba(0, 0, 0, 0.14),0px 4px 18px 3px rgba(0, 0, 0, 0.12)',
    '0px 6px 7px -4px rgba(0, 0, 0, 0.2),0px 11px 15px 1px rgba(0, 0, 0, 0.14),0px 4px 20px 3px rgba(0, 0, 0, 0.12)',
    '0px 7px 8px -4px rgba(0, 0, 0, 0.2),0px 12px 17px 2px rgba(0, 0, 0, 0.14),0px 5px 22px 4px rgba(0, 0, 0, 0.12)',
    '0px 7px 8px -4px rgba(0, 0, 0, 0.2),0px 13px 19px 2px rgba(0, 0, 0, 0.14),0px 5px 24px 4px rgba(0, 0, 0, 0.12)',
    '0px 7px 9px -4px rgba(0, 0, 0, 0.2),0px 14px 21px 2px rgba(0, 0, 0, 0.14),0px 5px 26px 4px rgba(0, 0, 0, 0.12)',
    '0px 8px 9px -5px rgba(0, 0, 0, 0.2),0px 15px 22px 2px rgba(0, 0, 0, 0.14),0px 6px 28px 5px rgba(0, 0, 0, 0.12)',
    '0px 8px 10px -5px rgba(0, 0, 0, 0.2),0px 16px 24px 2px rgba(0, 0, 0, 0.14),0px 6px 30px 5px rgba(0, 0, 0, 0.12)',
    '0px 8px 11px -5px rgba(0, 0, 0, 0.2),0px 17px 26px 2px rgba(0, 0, 0, 0.14),0px 6px 32px 5px rgba(0, 0, 0, 0.12)',
    '0px 9px 11px -5px rgba(0, 0, 0, 0.2),0px 18px 28px 2px rgba(0, 0, 0, 0.14),0px 7px 34px 6px rgba(0, 0, 0, 0.12)',
    '0px 9px 12px -6px rgba(0, 0, 0, 0.2),0px 19px 29px 2px rgba(0, 0, 0, 0.14),0px 7px 36px 6px rgba(0, 0, 0, 0.12)',
    '0px 10px 13px -6px rgba(0, 0, 0, 0.2),0px 20px 31px 3px rgba(0, 0, 0, 0.14),0px 8px 38px 7px rgba(0, 0, 0, 0.12)',
    '0px 10px 13px -6px rgba(0, 0, 0, 0.2),0px 21px 33px 3px rgba(0, 0, 0, 0.14),0px 8px 40px 7px rgba(0, 0, 0, 0.12)',
    '0px 10px 14px -6px rgba(0, 0, 0, 0.2),0px 22px 35px 3px rgba(0, 0, 0, 0.14),0px 8px 42px 7px rgba(0, 0, 0, 0.12)',
    '0px 11px 14px -7px rgba(0, 0, 0, 0.2),0px 23px 36px 3px rgba(0, 0, 0, 0.14),0px 9px 44px 8px rgba(0, 0, 0, 0.12)',
    '0px 11px 15px -7px rgba(0, 0, 0, 0.2),0px 24px 38px 3px rgba(0, 0, 0, 0.14),0px 9px 46px 8px rgba(0, 0, 0, 0.12)'
  ],
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    display4: {
      fontSize: '6rem',
      fontWeight: 300,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      letterSpacing: '-.04em',
      lineHeight: '112px',
      marginLeft: '-.04em',
      color: 'rgba(0, 0, 0, 0.54)'
    },
    display3: {
      fontSize: '3.5rem',
      fontWeight: 400,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      letterSpacing: '-.02em',
      lineHeight: '72px',
      marginLeft: '-.02em',
      color: 'rgba(0, 0, 0, 0.54)'
    },
    display2: {
      fontSize: '2.8125rem',
      fontWeight: 400,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      lineHeight: '56px',
      marginLeft: '-.02em',
      color: 'rgba(0, 0, 0, 0.54)'
    },
    display1: {
      fontSize: '2.125rem',
      fontWeight: 400,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      lineHeight: '40px',
      color: 'rgba(0, 0, 0, 0.54)'
    },
    headline: {
      fontSize: '1.5rem',
      fontWeight: 400,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      lineHeight: '28px',
      color: 'rgba(0, 0, 0, 0.87)'
    },
    title: {
      fontSize: '1.3125rem',
      fontWeight: 500,
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      lineHeight: '1.16667em',
      color: 'rgba(0, 0, 0, 0.87)'
    },
    subheading: {
      fontSize: '1rem',
      fontWeight: 400,
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      lineHeight: '1.5em',
      color: 'rgba(0, 0, 0, 0.87)'
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      lineHeight: '20px',
      color: 'rgba(0, 0, 0, 0.87)'
    },
    body1: {
      fontSize: '0.875rem',
      fontWeight: 400,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      lineHeight: '20px',
      color: 'rgba(0, 0, 0, 0.87)'
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      lineHeight: '1.375em',
      color: 'rgba(0, 0, 0, 0.54)'
    },
    button: {
      fontSize: '0.875rem',
      textTransform: 'none',
      fontWeight: 500,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      color: 'rgba(0, 0, 0, 0.87)',
      lineHeight: '16px'
    },
    title2: {
      fontSize: '1.25rem',
      fontWeight: 500,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      lineHeight: '24px'
    },
    title1: {
      fontSize: '1.25rem',
      fontWeight: 400,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      lineHeight: '24px'
    },
    subheading2: {
      fontSize: '1rem',
      fontWeight: 500,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      lineHeight: '22px'
    },
    subheading1: {
      fontSize: '1rem',
      fontWeight: 400,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      lineHeight: '22px'
    },
    caption2: {
      fontSize: '0.75rem',
      fontWeight: 500,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      lineHeight: '16px'
    },
    caption1: {
      fontSize: '0.75rem',
      fontWeight: 400,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      lineHeight: '16px'
    }
  },
  shape: {
    borderRadius: 4,
    border1: '1px solid rgba(255,55,55,.1)',
    border2: '1px solid #dbdbdb',
    border3: '1px solid rgba(0, 0, 0, 0.36)',
    border4: '1px solid #eee'
  },
  spacing: 4,
  transitions: {
    create: () => '',
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195
    }
  },
  zIndex: {
    mobileStepper: 1000,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
    ripple: 1,
    elementOnRipple: 2,
    loading: 1000,
    dragging: 2000,
    moreMenu: 999,
    toast: 3000,
    memberListHeader: 100,
    floatButton: 10,
    makeZIndexStackingContext: 1,
    codeEditor: 0
  },
  size: { width: 4, height: 4 },
  boxShadow: {
    val1:
      '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.12), 0 0 2px 0 rgba(0, 0, 0, 0.14)',
    val2: '0 -2px 4px -2px rgba(0, 0, 0, 0.14)',
    val3: '0 3px 1px -2px rgba(0, 0, 0, 0.14)'
  },
  maxHeight: { dialog: '72vh' },
  opacity: [0.1, 0.2],
  radius: {
    circle: '50%',
    zero: '0px',
    sm: '2px',
    md: '3px',
    lg: '4px',
    xl: '8px',
    xxl: '16px'
  }
};

const theme = createMuiTheme(rawTheme as any);

const mountWithTheme = (content: React.ReactNode) =>
  mount(<ThemeProvider theme={theme}>{content}</ThemeProvider>);

const asyncMountWithTheme = async (content: React.ReactNode) =>
  await mount(<ThemeProvider theme={theme}>{content}</ThemeProvider>);

export { theme, mountWithTheme, asyncMountWithTheme };
