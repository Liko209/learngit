/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:05
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { name2icon } from './name2icon';
import styled, { css } from '../styled-components';
import { Palette } from '../theme/theme';
import { palette, width } from '../utils/styles';
import { RuiCircularProgress } from 'rcui/components/Progress';

export type IconColor = [keyof Palette, string];

const sizes = {
  extraSmall: 3,
  small: 4,
  medium: 5,
  large: 6,
  moreLarge: 8,
  extraLarge: 9,
};

export type IconSize =
  | 'extraSmall'
  | 'small'
  | 'medium'
  | 'large'
  | 'inherit'
  | 'moreLarge'
  | 'extraLarge'
  | 'mediumLarge';

type JuiIconographyProps = {
  iconColor?: IconColor;
  iconSize?: IconSize;
  children?: string;
  symbol?: SvgSymbol;
  useLoading?: boolean;
  loadingSize?: number;
  desc?: string;
} & React.HTMLAttributes<HTMLElement>;

type SvgSymbol = {
  id: string;
  viewBox: string;
  content: string;
  node?: SVGSymbolElement;
};

const StyledSpan = styled('span')<React.HTMLAttributes<HTMLElement>>`
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
  ref,
) => {
  const {
    children,
    className,
    iconColor,
    iconSize,
    symbol,
    desc,
    useLoading = false,
    loadingSize = 16,
    ...rest
  } = props;
  const iconName = name2icon[children as string];
  const useHref = symbol ? `#${symbol.id}` : `#icon-${iconName}`;
  const _className = `${className || ''} ${children || ''} icon`;
  return useLoading ? (
    <RuiCircularProgress size={loadingSize} ref={ref as any} />
  ) : (
    <StyledSpan className={_className} {...rest} ref={ref as any}>
      <StyledSvg role="img" iconColor={iconColor} size={iconSize}>
        {!!desc && <title>{desc}</title>}
        <use xlinkHref={useHref} href={useHref} />
      </StyledSvg>
    </StyledSpan>
  );
};

JuiIconographyComponent.displayName = 'JuiIconography';

const JuiIconography = React.memo(React.forwardRef(JuiIconographyComponent));
export { JuiIconographyProps, JuiIconography, SvgSymbol };
