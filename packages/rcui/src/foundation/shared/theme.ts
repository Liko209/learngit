import {
  Palette,
  Typography,
  Opacity,
  Radius,
  Shadows,
  ZIndex,
} from '../styles';
import { css } from '../styled-components';

/**
 * spacing
 * @param values
 */
function spacing(...values: number[]) {
  return ({ theme }: any): string => {
    if (values.length === 1) {
      return `${theme.spacing(...values)}px`;
    }
    return theme.spacing(...values);
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

/**
 * opacity
 * @param values
 */
function opacity(name: keyof Opacity) {
  return ({ theme }: any) => {
    return theme.opacity[name];
  };
}

/**
 * radius
 * @param values
 */
function radius(name: keyof Radius) {
  return ({ theme }: any) => {
    return theme.radius[name];
  };
}

/**
 * shadow
 * @param values
 */
function shadows(name: keyof Shadows) {
  return ({ theme }: any) => {
    return theme.shadows[name];
  };
}

/**
 * zIndex
 * @param values
 */
function zIndex(name: keyof ZIndex) {
  return ({ theme }: any) => {
    return theme.zIndex[name];
  };
}

/** ******************************************
 *                 Colors                   *
 ******************************************* */

/**
 * colors
 * @param name
 * @param sub
 * @param key
 */
function palette<T extends keyof Palette, K extends keyof Palette[T]>(
  name: T,
  sub?: K,
) {
  return ({ theme }: any) => {
    return sub ? theme.palette[name][sub] : theme.palette[name];
  };
}

/**
 * grey
 * @param sub
 * @param opacities
 */
function grey(sub: keyof Palette['grey']) {
  return palette('grey', sub);
}

/** ******************************************
 *              Font                  *
 ******************************************* */

/**
 * Font
 * @param name
 */
function typography<T extends keyof Typography, K extends keyof Typography[T]>(
  name: T,
  sub?: K,
) {
  if (name === 'fontFamily' || name === 'codeFontFamily') {
    return css`
      font-family: ${fontProp(name)};
    `;
  }
  if (name === 'fontSize') {
    return css`
      font-size: ${fontProp(name)};
    `;
  }
  if (
    name === 'fontWeightLight' ||
    name === 'fontWeightRegular' ||
    name === 'fontWeightMedium'
  ) {
    return css`
      font-weight: ${fontProp(name)};
    `;
  }
  return css`
    font-size: ${fontProp(name, sub, 'fontSize')};
    font-weight: ${fontProp(name, sub, 'fontWeight')};
    line-height: ${fontProp(name, sub, 'lineHeight')};
  `;
}

function fontProp<T extends keyof Typography, K extends keyof Typography[T]>(
  name: T,
  sub?: K,
  key?: any,
) {
  return ({ theme }: any) => {
    const font = sub ? theme.typography[name][sub] : theme.typography[name];
    return key ? font[key] : font;
  };
}

export { spacing, opacity, radius, shadows, zIndex, palette, typography, grey, ellipsis };
