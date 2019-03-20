/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:05
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { name2icon } from './name2icon';
import styled, { css } from '../../foundation/styled-components';
import { Palette } from '../theme/theme';
import { palette, width } from '../../foundation/utils/styles';

export type IconColor = [keyof Palette, string];

const sizes = {
  extraSmall: 3,
  small: 4,
  medium: 5,
  large: 6,
  extraLarge: 9,
};

export type IconSize =
  | 'extraSmall'
  | 'small'
  | 'medium'
  | 'large'
  | 'inherit'
  | 'extraLarge';

type JuiIconographyProps = {
  iconColor?: IconColor;
  iconSize?: IconSize;
  children: string;
} & React.HTMLAttributes<HTMLElement>;

const StyledSpan = styled('span')`
  display: inline-flex;
`;

const StyledSvg = styled('svg')<{ iconColor?: IconColor; size?: IconSize }>`
  display: inline-block;
  width: 1em;
  height: 1em;
  stroke-width: 0;
  stroke: currentColor;
  fill: currentColor;
  pointer-events: none;
  font-size: ${({ size = 'large' }) =>
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
  const { children, className, iconColor, iconSize, ...rest } = props;
  const iconName = name2icon[children as string];
  const _className = `${className || ''} ${children} icon`;
  return (
    <StyledSpan className={_className} {...rest}>
      <StyledSvg iconColor={iconColor} size={iconSize}>
        <use xlinkHref={`#icon-${iconName}`} href={`#icon-${iconName}`} />
      </StyledSvg>
    </StyledSpan>
  );
};

JuiIconographyComponent.displayName = 'JuiIconography';

const JuiIconography = React.memo(JuiIconographyComponent);
export { JuiIconographyProps, JuiIconography };
