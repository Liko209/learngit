import { Theme, CustomPalette } from '../theme';
import { Palette } from '@material-ui/core/styles/createPalette';
import { css } from '../styled-components';

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
  return values.map(n => n + 'px').join(' ');
}

/********************************************
 *                 Colors                   *
 ********************************************/
/**
 * Palette
 * @param name
 * @param sub
 */
function palette(name: keyof Palette | keyof CustomPalette, sub: string) {
  return ({ theme }: { theme: Theme }) => theme.palette[name][sub];
}

/**
 * primary color
 * @param sub
 */
function primary(sub: string) {
  return palette('primary', sub);
}

/**
 * secondary color
 * @param sub
 */
function secondary(sub: string) {
  return palette('primary', sub);
}

/**
 * grey
 * @param sub
 */
function grey(sub: string) {
  return palette('grey', sub);
}

/**
 * typography
 * @param name
 */
function typography(name: string) {
  return css`
    font-size: ${({ theme }: { theme: Theme }) => theme.typography[name].fontSize};
    font-weight: ${({ theme }: { theme: Theme }) => theme.typography[name].fontWeight};
    font-family: ${({ theme }: { theme: Theme }) => theme.typography[name].fontFamily};
    line-height: ${({ theme }: { theme: Theme }) => theme.typography[name].lineHeight || ''};
    letter-spacing: ${({ theme }: { theme: Theme }) => theme.typography[name].letterSpacing || ''};
  `;
}

export { spacing, width, height, palette, cssValue, primary, secondary, grey, typography };
