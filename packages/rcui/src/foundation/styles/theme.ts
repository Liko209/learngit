import palette from './theme/palette.json';
import typography from './theme/typography.json';
import opacity from './theme/opacity.json';
import radius from './theme/radius.json';
import spacing from './theme/spacing.json';
import zIndex from './theme/zIndex.json';
import breakpoints from './theme/breakpoints.json';
import boxShadow from './theme/boxShadow.json';

import {
  Theme as MuiTheme,
  ThemeOptions,
} from '@material-ui/core/styles/createMuiTheme';
import { Transitions } from '@material-ui/core/styles/transitions';
import { Shadows } from '@material-ui/core/styles/shadows';
import { ZIndex as MuiZIndex } from '@material-ui/core/styles/zIndex';
import { Spacing as MuiSpacing } from '@material-ui/core/styles/spacing';
import { Typography as MuiTypography } from '@material-ui/core/styles/createTypography';
import {
  Palette as MuiPalette,
  PaletteColor,
} from '@material-ui/core/styles/createPalette';

export type Palette = { [P in keyof typeof palette]: PaletteColor } &
  MuiPalette;
export type Typography = typeof typography & MuiTypography;
export type Opacity = typeof opacity;
export type Radius = typeof radius;
export type Spacing = typeof spacing & MuiSpacing;
export type ZIndex = typeof zIndex & MuiZIndex;
export type boxShadow = typeof boxShadow;
export type size = {
  width: number;
  height: number;
};

export { Transitions, Shadows };

export type Theme = {
  palette: Palette;
  typography: Typography;
  opacity: Opacity;
  radius: Radius;
  spacing: Spacing;
  zIndex: ZIndex;
  tooltip: {
    dark: string;
  };
  size: size;
  boxShadow: boxShadow;
  shape: {
    border1: string;
    border2: string;
    border3: string;
    border4: string;
  };
} & MuiTheme;

export type PaletteOptions = typeof palette;
export type TypographyOptions = typeof typography;
export type OpacityOptions = Opacity;
export type RadiusOptions = Radius;
export type SpacingOptions = typeof spacing;
export type ZIndexOptions = typeof zIndex;
export type BreakpointsOptions = typeof breakpoints;

export type ThemeOptions = {
  palette: PaletteOptions;
  typography: TypographyOptions;
  opacity: OpacityOptions;
  radius: OpacityOptions;
  spacing: SpacingOptions;
  zIndex: ZIndexOptions;
  breakpoints: BreakpointsOptions;
};
