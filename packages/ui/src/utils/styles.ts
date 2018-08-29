import { Theme } from '../theme';
import { Palette } from '@material-ui/core/styles/createPalette';

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
function palette(name: keyof Palette, sub: string) {
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

export { spacing, palette, cssValue, primary, secondary, grey };
