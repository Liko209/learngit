export const rawTheme = {
  breakpoints: {
    keys: ['xs', 'sm', 'md', 'lg', 'xl'],
    values: { xs: 0, sm: 640, md: 960, lg: 1280, xl: 1920 },
  },
  direction: 'ltr',
  mixins: {
    toolbar: {
      minHeight: 56,
      '@media (min-width:0px) and (orientation: landscape)': { minHeight: 48 },
      '@media (min-width:640px)': { minHeight: 64 },
    },
  },
  overrides: {},
  palette: {
    common: { black: '#000', white: '#fff' },
    type: 'light',
    primary: {
      '50': '#e1f4fb',
      '100': '#b2e3f4',
      '200': '#82d1ed',
      '300': '#66bffa',
      '400': '#34b1e2',
      '500': '#18a4de',
      '600': '#4475fd',
      '700': '#0684bd',
      '800': '#005488',
      '900': '#005488',
      main: '#0684bd',
      light: '#18a4de',
      dark: '#005488',
      contrastText: '#fff',
    },
    secondary: {
      '50': '#fff3e0',
      '100': '#ffdfb1',
      '200': '#ffca7f',
      '300': '#ffb44c',
      '400': '#ffa424',
      '500': '#ff9400',
      '600': '#ff8800',
      '700': '#f97802',
      '800': '#f36703',
      '900': '#ea4b04',
      main: '#ff8800',
      light: '#ffa424',
      dark: '#f36703',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    error: {
      main: '#F44336',
      light: 'rgb(246, 104, 94)',
      dark: 'rgb(170, 46, 37)',
      contrastText: '#fff',
    },
    grey: {
      '50': '#fafafa',
      '100': '#f5f6fb',
      '200': '#eeeeee',
      '300': '#e0e0e0',
      '400': '#bdbdbd',
      '500': '#9e9e9e',
      '600': '#757575',
      '700': '#616161',
      '800': '#424242',
      '900': '#212121',
      A100: '#d5d5d5',
      A200: '#aaaaaa',
      A400: '#303030',
      A700: '#616161',
    },
    contrastThreshold: 3,
    tonalOffset: 0.2,
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.54)',
      disabled: 'rgba(0, 0, 0, 0.38)',
      hint: 'rgba(0, 0, 0, 0.38)',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    background: {
      paper: '#fff',
      default: '#fafafa',
      disabled: 'rgba(255,55,55,.05)',
    },
    action: {
      active: '#EBF6FA',
      hover: 'rgba(0, 0, 0, 0.08)',
      hoverOpacity: 0.12,
      selected: 'rgba(0, 0, 0, 0.14)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
    },
    success: {
      main: '#26A304',
      light: 'rgb(81, 181, 54)',
      dark: 'rgb(26, 114, 2)',
      contrastText: '#fff',
    },
    info: {
      main: '#F6AD16',
      light: 'rgb(247, 189, 68)',
      dark: 'rgb(172, 121, 15)',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    warning: {
      main: '#8C8C8C',
      light: 'rgb(163, 163, 163)',
      dark: 'rgb(98, 98, 98)',
      contrastText: '#fff',
    },
    tooltip: {
      main: '#616161',
      dark: '#616161',
      light: 'rgb(128, 128, 128)',
      contrastText: '#fff',
    },
    semantic: {
      negative: '#f44336',
      positive: '#26a304',
      critical: '#f6ad16',
      neutral: '#616161',
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
      persimmon: '#ff793d',
    },
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
      lake: '#6FAFEB',
    },
  },
  props: {},
  shadows: [
    'none',
    '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 2px 1px -1px rgba(0, 0, 0, 0.12);',
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
    '0px 11px 15px -7px rgba(0, 0, 0, 0.2),0px 24px 38px 3px rgba(0, 0, 0, 0.14),0px 9px 46px 8px rgba(0, 0, 0, 0.12)',
  ],
  typography: {
    suppressWarning: true,
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
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
      color: 'rgba(0, 0, 0, 0.54)',
    },
    display3: {
      fontSize: '3.5rem',
      fontWeight: 400,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      letterSpacing: '-.02em',
      lineHeight: '72px',
      marginLeft: '-.02em',
      color: 'rgba(0, 0, 0, 0.54)',
    },
    display2: {
      fontSize: '2.8125rem',
      fontWeight: 400,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      lineHeight: '56px',
      marginLeft: '-.02em',
      color: 'rgba(0, 0, 0, 0.54)',
    },
    display1: {
      fontSize: '2.125rem',
      fontWeight: 400,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      lineHeight: '40px',
      color: 'rgba(0, 0, 0, 0.54)',
    },
    headline: {
      fontSize: '1.5rem',
      fontWeight: 400,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      lineHeight: '28px',
      color: 'rgba(0, 0, 0, 0.87)',
    },
    title: {
      fontSize: '1.3125rem',
      fontWeight: 500,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      lineHeight: '1.16667em',
      color: 'rgba(0, 0, 0, 0.87)',
    },
    subheading: {
      fontSize: '1rem',
      fontWeight: 400,
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      lineHeight: '1.5em',
      color: 'rgba(0, 0, 0, 0.87)',
    },
    body2: {
      color: 'rgba(0, 0, 0, 0.87)',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: '20px',
    },
    body1: {
      color: 'rgba(0, 0, 0, 0.87)',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: '20px',
    },
    caption: {
      color: 'rgba(0, 0, 0, 0.87)',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.66,
    },
    button: {
      color: 'rgba(0, 0, 0, 0.87)',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: '16px',
      textTransform: 'none',
    },
    h1: {
      color: 'rgba(0, 0, 0, 0.87)',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontWeight: 300,
      fontSize: '6rem',
      lineHeight: 1,
    },
    h2: {
      color: 'rgba(0, 0, 0, 0.87)',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontWeight: 300,
      fontSize: '3.75rem',
      lineHeight: 1,
    },
    h3: {
      color: 'rgba(0, 0, 0, 0.87)',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontWeight: 400,
      fontSize: '3rem',
      lineHeight: 1.04,
    },
    h4: {
      color: 'rgba(0, 0, 0, 0.87)',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontWeight: 400,
      fontSize: '2.125rem',
      lineHeight: 1.17,
    },
    h5: {
      color: 'rgba(0, 0, 0, 0.87)',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontWeight: 400,
      fontSize: '1.5rem',
      lineHeight: 1.33,
    },
    h6: {
      color: 'rgba(0, 0, 0, 0.87)',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.6,
    },
    subtitle1: {
      color: 'rgba(0, 0, 0, 0.87)',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.75,
    },
    subtitle2: {
      color: 'rgba(0, 0, 0, 0.87)',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.57,
    },
    body1Next: {
      color: 'rgba(0, 0, 0, 0.87)',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2Next: {
      color: 'rgba(0, 0, 0, 0.87)',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    buttonNext: {
      color: 'rgba(0, 0, 0, 0.87)',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.75,
      textTransform: 'uppercase',
    },
    captionNext: {
      color: 'rgba(0, 0, 0, 0.87)',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.66,
    },
    overline: {
      color: 'rgba(0, 0, 0, 0.87)',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 2.66,
      textTransform: 'uppercase',
    },
    useNextVariants: true,
    codeFontFamily: 'Courier',
    title2: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: '24px',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    },
    title1: {
      fontSize: '1.25rem',
      fontWeight: 400,
      lineHeight: '24px',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    },
    subheading3: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: '22px',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    },
    subheading2: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: '22px',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    },
    subheading1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: '22px',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    },
    caption2: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: '16px',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    },
    caption1: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: '16px',
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    },
  },
  shape: {
    borderRadius: 4,
    border1: '1px solid rgba(255,55,55,.1)',
    border2: '1px solid #dbdbdb',
    border3: '1px solid rgba(0, 0, 0, 0.36)',
    border4: '1px solid #eee',
  },
  spacing: {
    unit: 4,
    xxxs: '4px',
    xxs: '8px',
    xs: '12px',
    s: '16px',
    m: '20px',
    l: '24px',
    xl: '32px',
    xxl: '40px',
    xxxl: '48px',
  },
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
  zIndex: {
    mobileStepper: 1000,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 10000,
    tooltip: 1500,
    default: 1,
    banner: 9500,
    dialog: 6000,
    mask: 5000,
    popup: 3000,
    spinner: 9050,
    model: 9000,
    dropdown: 7000,
    ripple: 1,
    elementOnRipple: 2,
    loading: 1000,
    dragging: 2000,
    moreMenu: 999,
    memberListHeader: 100,
    toast: 3000,
    floatButton: 10,
    codeEditor: 0,
    makeZIndexStackingContext: 1,
  },
  opacity: {
    '1': 0.1,
    '2': 0.2,
    '3': 0.3,
    '4': 0.4,
    '5': 0.5,
    '6': 0.6,
    '7': 0.7,
    '8': 0.8,
    '9': 0.9,
  },
  radius: {
    circle: '50%',
    zero: '0px',
    sm: '2px',
    md: '3px',
    lg: '4px',
    xl: '8px',
    xxl: '16px',
  },
  size: { width: 4, height: 4 },
  boxShadow: {
    val1:
      '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.12), 0 0 2px 0 rgba(0, 0, 0, 0.14)',
    val2: '0 -2px 4px -2px rgba(0, 0, 0, 0.14)',
    val3: '0 3px 1px -2px rgba(0, 0, 0, 0.14)',
    val16:
      '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
  },
  maxHeight: { dialog: '72vh' },
};
