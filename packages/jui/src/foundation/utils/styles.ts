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
 * @param opacity
 */
function palette(name: keyof Palette, sub: string, opacity?: number) {
  if (!opacity) return getPalette(name, sub);

  return ({ theme }: { theme: Theme }) =>
    tinycolor(getPalette(name, sub)({ theme }))
      .setAlpha(
        String(opacity).indexOf('.') > -1
          ? opacity
          : theme.palette.action.hoverOpacity * opacity,
      )
      .toRgbString();
}

/**
 * primary color
 * @param sub
 * @param opacity
 */
function primary(sub: string = 'main', opacity?: number) {
  return palette('primary', sub, opacity);
}

/**
 * secondary color
 * @param sub
 * @param opacity
 */
function secondary(sub: string = 'main', opacity?: number) {
  return palette('secondary', sub, opacity);
}

/**
 * grey
 * @param sub
 * @param opacity
 */
function grey(sub: string, opacity?: number) {
  return palette('grey', sub, opacity);
}

function activeOpacity() {
  return css`
    opacity: ${({ theme }: { theme: Theme }) =>
      1 - theme.palette.action.hoverOpacity * 2};
  `;
}

function disabledOpacity() {
  return css`
    opacity: ${({ theme }: { theme: Theme }) =>
      theme.palette.action.hoverOpacity * 2};
  `;
}

function disabled() {
  return css`
    background-color: rgba(0, 0, 0, 0.12);
    color: rgba(0, 0, 0, 0.26);
  `;
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
    word-break: break-word;
  `;
}

function lineClamp(lineNumber: number, maxHeight: number) {
  return css`
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: ${lineNumber};
    -webkit-box-orient: vertical;
    max-height: ${height(maxHeight)};
    word-break: break-word;
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

function radius(type: keyof Theme['radius']) {
  return ({ theme }: { theme: Theme }): string | number => {
    return theme.radius[type];
  };
}

function opacity(type: keyof Theme['opacity']) {
  return ({ theme }: { theme: Theme }): number => {
    return theme.opacity[type];
  };
}

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
  activeOpacity,
  disabledOpacity,
  disabled,
  typography,
  ellipsis,
  lineClamp,
  rippleEnter,
  radius,
  opacity,
};
