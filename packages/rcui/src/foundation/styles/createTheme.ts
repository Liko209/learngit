import deepmerge from 'deepmerge';
import palette from './theme/palette.json';
import typography from './theme/typography.json';
import opacity from './theme/opacity.json';
import radius from './theme/radius.json';
import zIndex from './theme/zIndex.json';
import breakpoints from './theme/breakpoints.json';
import { createMuiTheme } from '@material-ui/core/styles';
import createMuiPalette from '@material-ui/core/styles/createPalette';
import { Theme, ThemeOptions, PaletteOptions } from './theme';

function createPalette(paletteOptions: PaletteOptions) {
  const { augmentColor } = createMuiPalette(paletteOptions);
  Object.keys(paletteOptions).forEach((key: keyof PaletteOptions) => {
    if (palette[key]) {
      augmentColor(paletteOptions[key]);
    }
  });

  return paletteOptions;
}

function createTheme(options: Partial<ThemeOptions> = {}) {
  const {
    palette: paletteInput = {},
    typography: typographyInput = {},
    opacity: opacityInput = {},
    radius: radiusInput = {},
    zIndex: zIndexInput = {},
    breakpoints: breakpointsInput = {}
  } = options;

  // suppress material-ui warning
  // @ts-ignore
  typographyInput.suppressWarning = true;

  const theme = deepmerge(
    {
      palette: createPalette(deepmerge(palette, paletteInput)),
      typography: deepmerge(typography, typographyInput),
      opacity: deepmerge(opacity, opacityInput),
      radius: deepmerge(radius, radiusInput),
      spacing: 4,
      zIndex: deepmerge(zIndex, zIndexInput),
      breakpoints: deepmerge(breakpoints, breakpointsInput)
    },
    options
  );

  return createMuiTheme(theme as any) as Theme;
}

export default createTheme;
