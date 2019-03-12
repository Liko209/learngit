/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:05
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
<<<<<<< HEAD
import { name2icon } from './name2icon';
=======
import name2icon from './name2icon';
>>>>>>> hotfix/1.1.1.190305
import styled, { css } from '../../foundation/styled-components';
import { Palette } from '../theme/theme';
import { palette, width } from '../../foundation/utils/styles';

type IconColor = [keyof Palette, string];

const sizes = {
  small: 4,
<<<<<<< HEAD
  medium: 5,
  large: 6,
  extraLarge: 9,
};

type IconSize = 'small' | 'medium' | 'large' | 'inherit' | 'extraLarge';

type JuiIconographyProps = {
  iconColor?: IconColor;
  iconSize?: IconSize;
=======
  default: 6,
  large: 9,
};

type FontSize = 'small' | 'default' | 'large' | 'inherit';

type JuiIconographyProps = {
  iconColor?: IconColor;
  fontSize?: FontSize;
>>>>>>> hotfix/1.1.1.190305
  children: string;
} & React.HTMLAttributes<HTMLElement>;

const StyledSpan = styled('span')`
  display: inline-flex;
`;

<<<<<<< HEAD
const StyledSvg = styled('svg')<{ iconColor?: IconColor; size?: IconSize }>`
=======
const StyledSvg = styled('svg')<{ iconColor?: IconColor; size?: FontSize }>`
>>>>>>> hotfix/1.1.1.190305
  display: inline-block;
  width: 1em;
  height: 1em;
  stroke-width: 0;
  stroke: currentColor;
  fill: currentColor;
<<<<<<< HEAD
  pointer-events: none;
  font-size: ${({ size = 'large' }) =>
=======
  font-size: ${({ size = 'default' }) =>
>>>>>>> hotfix/1.1.1.190305
    size !== 'inherit' ? width(sizes[size]) : 'inherit'};
  ${({ theme, iconColor }) => {
    if (!iconColor) {
      return;
    }
    const colorScope = iconColor[0] || 'grey';
    const colorName = iconColor[1] || '400';
    return css`
      fill: ${palette(colorScope, colorName)({ theme })}};
    `;
  }};
`;

const JuiIconographyComponent: React.SFC<JuiIconographyProps> = (
  props: JuiIconographyProps,
) => {
<<<<<<< HEAD
  const { children, className, iconColor, iconSize, ...rest } = props;
=======
  const { children, className, iconColor, fontSize, ...rest } = props;
>>>>>>> hotfix/1.1.1.190305
  const iconName = name2icon[children as string];
  const _className = `${className || ''} ${children} icon`;
  return (
    <StyledSpan className={_className} {...rest}>
<<<<<<< HEAD
      <StyledSvg iconColor={iconColor} size={iconSize}>
        <use xlinkHref={`#icon-${iconName}`} href={`#icon-${iconName}`} />
=======
      <StyledSvg iconColor={iconColor} size={fontSize}>
        <use xlinkHref={`#icon-${iconName}`} />
>>>>>>> hotfix/1.1.1.190305
      </StyledSvg>
    </StyledSpan>
  );
};

JuiIconographyComponent.displayName = 'JuiIconography';

const JuiIconography = React.memo(JuiIconographyComponent);
export { JuiIconographyProps, JuiIconography };
