/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-04 13:57:26
 * Copyright © RingCentral. All rights reserved.
 */
import { ThemeProps as StyledThemeProps } from 'styled-components';
import { Theme as MuiTheme } from '@material-ui/core/styles/createMuiTheme';

type IPalette = {
  primary: {
    light: string,
    main: string,
    dark: string,
    900: string,
    800: string,
    700: string,
    600: string,
    500: string,
    400: string,
    300: string,
    200: string,
    100: string,
    50: string,
  },
  secondary: {
    light: string,
    main: string,
    dark: string,
    900: string,
    800: string,
    700: string,
    600: string,
    500: string,
    400: string,
    300: string,
    200: string,
    100: string,
    50: string,
  },
  semantic: {
    negative: string,
    positive: string,
    critical: string,
    neutral: string,
  },
  accent: {
    ash: string,
    lake: string,
    tiffany: string,
    cateye: string,
    grass: string,
    gold: string,
    persimmon: string,
    tomato: string,
  },
  action: {
    hoverOpacity: number,
    active: string,
  },
};

type ITheme = {
  palette: IPalette,

  shape: {
    borderRadius: number,
  },
  spacing: {
    unit: number,
  },
  zIndex: {
    supernatant: number,
  },
  size: {
    width: number,
    height: number,
  },
  typography: {
    title1: {
      fontSize: string,
      fontWeight: number,
      fontFamily: string,
      lineHeight: string,
    },
    title2: {
      fontSize: string,
      fontWeight: number,
      fontFamily: string,
      lineHeight: string,
    },
    subheading1: {
      fontSize: string,
      fontWeight: number,
      fontFamily: string,
      lineHeight: string,
    },
    subheading2: {
      fontSize: string,
      fontWeight: number,
      fontFamily: string,
      lineHeight: string,
    },
    caption1: {
      fontSize: string,
      fontWeight: number,
      fontFamily: string,
      lineHeight: string,
    },
    caption2: {
      fontSize: string,
      fontWeight: number,
      fontFamily: string,
      lineHeight: string,
    },
  },
  avatar: {
    'tomato': string,
    'blueberry': string,
    'oasis': string,
    'gold': string,
    'sage': string,
    'ash': string,
    'persimmon': string,
    'pear': string,
    'brass': string,
    'lake': string,
  },
};

type ThemeProps = StyledThemeProps<ITheme & MuiTheme>;

export {
  IPalette,
  ITheme,
  ThemeProps,
};
