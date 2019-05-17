/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-11 11:23:04
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { iconLabelMap, ICON_NAME } from './iconLabelMap';
import styled, { css } from '../../foundation/styled-components';
import { palette, spacing } from '../../foundation/shared/theme';
import { Palette } from '../../foundation/styles';

type IconColor = [keyof Palette, any];

type IconSize = 's' | 'm' | 'l' | 'inherit' | 'xl';

type RuiIconographyProps = {
  iconColor?: IconColor;
  iconSize?: IconSize;
  icon: ICON_NAME | string;
} & React.HTMLAttributes<HTMLElement>;

const StyledSpan = styled('span')`
  display: inline-flex;
`;

const StyledSvg = styled('svg') <{ iconColor?: IconColor; size?: IconSize }>`
  display: inline-block;
  width: 1em;
  height: 1em;
  stroke-width: 0;
  stroke: currentColor;
  fill: currentColor;
  pointer-events: none;
  font-size: ${({ size = 'l' }) =>
    size !== 'inherit' ? spacing(size) : 'inherit'};
  ${({ theme, iconColor }) => {
    if (!iconColor) {
      return;
    }
    const colorScope = iconColor[0] || 'grey';
    const colorName = iconColor[1] || '400';

    return css`
      fill: ${palette(colorScope, colorName)({ theme })}};
    `;
  }}
`;

function injectSvgFile() {
  import('./icon-symbol.svg').then(({ default: file }) => {
    fetch(file)
      .then(res => res.text())
      .then((data: string) => {
        const body = document.body;
        const x = document.createElement('x');
        x.innerHTML = data;
        let svg;
        svg = x.getElementsByTagName('svg')[0];
        if (svg) {
          svg.setAttribute('aria-hidden', 'true');
          svg.style.position = 'absolute';
          svg.style.width = '0';
          svg.style.height = '0';
          svg.style.overflow = 'hidden';
          body.insertBefore(svg, body.firstChild);
        }
      });
  });
}

const RuiIconographyComponent: React.FunctionComponent<RuiIconographyProps> = (
  props: RuiIconographyProps,
) => {
  const { className, icon, iconColor, iconSize, ...rest } = props;
  const iconLabel = iconLabelMap[icon] || icon;
  const _className = `${className || ''} ${icon} icon`;
  return (
    <StyledSpan className={_className} {...rest}>
      <StyledSvg iconColor={iconColor} size={iconSize}>
        <use xlinkHref={`#icon-${iconLabel}`} href={`#icon-${iconLabel}`} />
      </StyledSvg>
    </StyledSpan>
  );
};

RuiIconographyComponent.displayName = 'RuiIconography';

injectSvgFile();
const RuiIconography = React.memo(RuiIconographyComponent);
export { RuiIconographyProps, RuiIconography };
