/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-04 13:57:26
 * Copyright © RingCentral. All rights reserved.
 */
import { ThemeProps as StyledThemeProps } from 'styled-components';
import { Theme as MuiTheme } from '@material-ui/core/styles/createMuiTheme';
import { Palette as MuiPalette } from '@material-ui/core/styles/createPalette';
import { Omit } from '../../foundation/utils/typeHelper';

type Palette = {
  primary: {
    light: string;
    main: string;
    dark: string;
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
  secondary: {
    light: string;
    main: string;
    dark: string;
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
  };
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
  background: {
    disabled: string;
  };
  action: {
    hoverOpacity: number;
    active: string;
  };
  tooltip: {
    dark: string;
  };
  avatar: {
    tomato: string;
    blueberry: string;
    oasis: string;
    gold: string;
    sage: string;
    ash: string;
    persimmon: string;
    pear: string;
    brass: string;
    lake: string;
  };
} & MuiPalette;

type Theme = {
  palette: Palette;

  radius: {
    circle: string;
    round: number;
    zero: number;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };

  shape: {
    borderRadius: number;
    border1: string;
    border2: string;
    border3: string;
  };
  spacing: {
    unit: number;
  };
  zIndex: {
    ripple: number;
    elementOnRipple: number;
    loading: number;
    dragging: number;
    moreMenu: number;
    memberListHeader: number;
    toast: number;
    floatButton: number;
    codeEditor: number;
    modal: number;
    makeZIndexStackingContext: number;
  };
  size: {
    width: number;
    height: number;
  };
  typography: {
    display4: {
      fontSize: string;
      fontWeight: number;
      fontFamily: string;
      lineHeight: string;
    };
    display3: {
      fontSize: string;
      fontWeight: number;
      fontFamily: string;
      lineHeight: string;
    };
    display2: {
      fontSize: string;
      fontWeight: number;
      fontFamily: string;
      lineHeight: string;
    };
    display1: {
      fontSize: string;
      fontWeight: number;
      fontFamily: string;
      lineHeight: string;
    };
    headline: {
      fontSize: string;
      fontWeight: number;
      fontFamily: string;
      lineHeight: string;
    };
    title2: {
      fontSize: string;
      fontWeight: number;
      fontFamily: string;
      lineHeight: string;
    };
    title1: {
      fontSize: string;
      fontWeight: number;
      fontFamily: string;
      lineHeight: string;
    };
    subheading2: {
      fontSize: string;
      fontWeight: number;
      fontFamily: string;
      lineHeight: string;
    };
    subheading1: {
      fontSize: string;
      fontWeight: number;
      fontFamily: string;
      lineHeight: string;
    };
    body2: {
      fontSize: string;
      fontWeight: number;
      fontFamily: string;
      lineHeight: string;
    };
    body1: {
      fontSize: string;
      fontWeight: number;
      fontFamily: string;
      lineHeight: string;
    };
    caption2: {
      fontSize: string;
      fontWeight: number;
      fontFamily: string;
      lineHeight: string;
    };
    caption1: {
      fontSize: string;
      fontWeight: number;
      fontFamily: string;
      lineHeight: string;
    };
    button: {
      fontSize: string;
      fontWeight: number;
      fontFamily: string;
      lineHeight: string;
    };
  };
  boxShadow: {
    val1: string;
    val2: string;
    val3: string;
    val16: string;
  };
  maxHeight: {
    dialog: string;
  };
  transitions: {
    easing: {
      openCloseDialog: string;
    };
  };
  opacity: {
    p05: number;
    p10: number;
    p20: number;
    p30: number;
    p40: number;
    p50: number;
    p60: number;
    p70: number;
    p80: number;
    p90: number;
  };
} & Omit<MuiTheme, 'typography'>;

type ThemeProps = StyledThemeProps<Theme & MuiTheme>;
export { Palette, Theme, ThemeProps };
