import tinycolor from 'tinycolor2';
import { Theme, Palette } from '../theme/theme';
import { css } from '../styled-components';
import { keyframes } from 'styled-components';

/********************************************
 *               Dimensions                 *
 ********************************************/

/**
 * spacing
 * @param values
 */
function spacing(...values: number[]) {
  return ({ theme }: { theme: Theme }): string => {
    const unit = theme.spacing.unit;
    return cssValue(...values.map(n => n * unit));
  };
}

/**
 * shape
 * @param value
 */
function shape(key: string, times: number = 1) {
  return ({ theme }: { theme: Theme }): string => {
    const value = theme.shape[key];
    if (typeof value === 'number') {
      return cssValue(value * times);
    }
    return value;
  };
}

/**
 * width
 * @param values
 */
function width(...values: number[]) {
  return ({ theme }: { theme: Theme }): string => {
    const unit = theme.size.width;
    return cssValue(...values.map(n => n * unit));
  };
}

/**
 * height
 * @param values
 */
function height(...values: number[]) {
  return ({ theme }: { theme: Theme }): string => {
    const unit = theme.size.height;
    return cssValue(...values.map(n => n * unit));
  };
}

/**
 * add px for values
 * cssValue(1, 2, 3, 4); // returns: 1px 2px 3px 4px
 * @param values
 */
function cssValue(...values: number[]): string {
  return values.map(n => `${n}px`).join(' ');
}

/********************************************
 *                 Colors                   *
 ********************************************/

function getPalette(name: keyof Palette, sub: string = 'main') {
  return ({ theme }: { theme: Theme }) => theme.palette[name][sub];
}

/**
 * Palette
 * @param name
 * @param sub
 */
function palette(name: keyof Palette, sub: string, opacity?: number) {
  if (opacity) {
    return ({ theme }: { theme: Theme }) =>
      tinycolor(getPalette(name, sub)({ theme }))
        .setAlpha(theme.palette.action.hoverOpacity * opacity)
        .toRgbString();
  }
  return getPalette(name, sub);
}

/**
 * primary color
 * @param sub
 */
function primary(sub: string = 'main') {
  return palette('primary', sub);
}

/**
 * secondary color
 * @param sub
 */
function secondary(sub: string = 'main') {
  return palette('secondary', sub);
}

/**
 * grey
 * @param sub
 */
function grey(sub: string) {
  return palette('grey', sub);
}

/********************************************
 *              Typography                  *
 ********************************************/

/**
 * typography
 * @param name
 */
function typography(name: keyof Theme['typography']) {
  return css`
    font-size: ${typographyProp(name, 'fontSize')};
    font-weight: ${typographyProp(name, 'fontWeight')};
    font-family: ${typographyProp(name, 'fontFamily')};
    line-height: ${typographyProp(name, 'lineHeight')};
    letter-spacing: ${typographyProp(name, 'letterSpacing')};
  `;
}

function typographyProp(name: keyof Theme['typography'], key: string) {
  return ({ theme }: { theme: Theme }) => {
    const typography = theme.typography[name];
    if (typeof typography !== 'object') {
      throw new Error(`Unexpected typography name: ${name}`);
    }
    return typography[key];
  };
}

/**
 * ellipsis
 */
function ellipsis() {
  return css`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `;
}

const rippleEnter = (theme: Theme) => keyframes`
  from {
    transform: scale(0);
    opacity: 0.1;
  }
  to {
    transform: scale(1);
    opacity: ${theme.palette.action.hoverOpacity * 2};
  }
`;

export {
  spacing,
  shape,
  width,
  height,
  palette,
  cssValue,
  primary,
  secondary,
  grey,
  typography,
  ellipsis,
  rippleEnter,
};
