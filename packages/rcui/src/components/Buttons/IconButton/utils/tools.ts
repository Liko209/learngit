import tinycolor from 'tinycolor2';
import { keyframes } from '../../../../foundation/styled-components';
import { Theme, Palette } from '../../../../foundation/styles';
import { palette } from '../../../../foundation/shared/theme';

import { IconButtonVariant } from '../IconButton';

export const rippleEnter = (theme: Theme) => keyframes`
  from {
    transform: scale(0);
    opacity: 0.1;
  }
  to {
    transform: scale(1);
    opacity: ${palette('action', 'hoverOpacity')({ theme }) * 2};
  }
`;

export const hoverStyle = (
  colorScope: keyof Palette,
  colorName: any,
  theme: Theme,
  isReverse: boolean,
): string => {
  const color = palette(colorScope, colorName)({ theme });
  const opacity = theme.palette.action.hoverOpacity;
  return tinycolor(color)
    .setAlpha(isReverse ? 1 - opacity : opacity)
    .toRgbString();
};

export const variantHoverStyle = (
  variant: IconButtonVariant,
  colorScope: keyof Palette,
  colorName: any,
  theme: Theme,
): string => {
  if (variant === 'plain') {
    return 'transparent';
  }
  return hoverStyle(colorScope, colorName, theme, false);
};

export const reverseHoverStyle = (
  colorScope: keyof Palette,
  colorName: any,
  theme: Theme,
) => hoverStyle(colorScope, colorName, theme, true);

export const boxShadow = (
  theme: Theme,
) => {
  return `0px 1px 1px ${palette('grey', 500)({ theme })}`;
};
