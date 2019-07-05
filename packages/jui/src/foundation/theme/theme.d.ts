/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-04 13:57:26
 * Copyright © RingCentral. All rights reserved.
 */
import { ThemeProps as StyledThemeProps } from 'styled-components';
import {
  Theme as RcuiTheme,
  Palette as RcuiPalette,
  Typography,
  Opacity,
  Radius,
  Spacing,
  ZIndex,
} from 'rcui/foundation/styles/theme';

export {
  Typography,
  Opacity,
  Radius,
  Spacing,
  ZIndex,
} from 'rcui/foundation/styles/theme';

export type Shape = {
  borderRadius: number;
  border1: string;
  border2: string;
  border3: string;
  border4: string;
};

export type Size = {
  width: number;
  height: number;
};

export type Palette = RcuiPalette & {
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
};
export type Theme = RcuiTheme & {
  palette: Palette;
  shape: Shape;
  size: Size;
};
export type ThemeProps = StyledThemeProps<Theme>;
