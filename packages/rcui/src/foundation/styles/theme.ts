import palette from './theme/palette.json';
import typography from './theme/typography.json';
import opacity from './theme/opacity.json';
import radius from './theme/radius.json';
import zIndex from './theme/zIndex.json';
import breakpoints from './theme/breakpoints.json';

import {
  Theme as MuiTheme,
  ThemeOptions,
} from '@material-ui/core/styles/createMuiTheme';
import { Transitions } from '@material-ui/core/styles/transitions';
import { Shadows } from '@material-ui/core/styles/shadows';
import { ZIndex as MuiZIndex } from '@material-ui/core/styles/zIndex';
import {
  TypographyStyle,
  FontStyle,
  TypographyUtils,
} from '@material-ui/core/styles/createTypography';
import {
  Palette as MuiPalette,
  PaletteColor,
  ColorPartial,
  SimplePaletteColorOptions,
} from '@material-ui/core/styles/createPalette';

export type Palette = { [P in keyof typeof palette]: PaletteColor } &
  MuiPalette;

export type ThemeStyle =
  | 'display4'
  | 'display3'
  | 'display2'
  | 'display1'
  | 'headline'
  | 'title2'
  | 'title1'
  | 'subheading3'
  | 'subheading2'
  | 'subheading1'
  | 'body2'
  | 'body1'
  | 'caption2'
  | 'caption1'
  | 'button';

// tslint:disable-next-line: interface-name
export interface Typography
  extends Record<ThemeStyle, TypographyStyle>,
    FontStyle,
    TypographyUtils {}

export type Opacity = typeof opacity;
export type Radius = typeof radius;
export type ZIndex = typeof zIndex & MuiZIndex;

export { Transitions, Shadows };

export type Shape = {
  borderRadius: number;
  border1: string;
  border2: string;
  border3: string;
  border4: string;
};

export type Theme = {
  palette: Palette;
  typography: Typography;
  opacity: Opacity;
  radius: Radius;
  zIndex: ZIndex;
  shape: Shape;
} & MuiTheme;

export type PaletteOptions = typeof palette;
export type TypographyOptions = typeof typography;
export type OpacityOptions = Opacity;
export type RadiusOptions = Radius;
export type ZIndexOptions = typeof zIndex;
export type BreakpointsOptions = typeof breakpoints;
export type Color = [
  keyof PaletteOptions | 'grey',
  keyof ColorPartial | keyof SimplePaletteColorOptions
];

export type ThemeOptions = {
  palette: PaletteOptions;
  typography: TypographyOptions;
  opacity: OpacityOptions;
  radius: OpacityOptions;
  zIndex: ZIndexOptions;
  breakpoints: BreakpointsOptions;
};
