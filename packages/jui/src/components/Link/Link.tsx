/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:24:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import tinycolor from 'tinycolor2';
import styled from '../../foundation/styled-components';
import { typography, palette, grey } from '../../foundation/utils/styles';
import { Theme } from '../../foundation/theme/theme';

type Size = 'small' | 'medium' | 'large';

type JuiLinkProps = {
  size?: Size;
  disabled?: boolean;
  color?: 'primary' | 'secondary';
  Component?: React.ComponentType | keyof JSX.IntrinsicElements;
  handleOnClick?:
    | ((event: React.MouseEvent<HTMLSpanElement>) => void)
    | undefined;
};

const StyledComponent = styled<JuiLinkProps, 'span'>('span')`
  ${({ size }) => (size ? typography(typographySizeMap[size]) : '')}
  color: ${({ disabled, color = 'primary' }) =>
    disabled ? grey('500') : palette(color, 'main')};
  &:hover {
    text-decoration: ${({ disabled }) => (disabled ? 'none' : 'underline')};
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  }
  &:active {
    color: ${({ theme, color = 'primary' }) =>
      tinycolor(palette(color, 'main')({ theme }))
        .setAlpha(1 - theme.palette.action.hoverOpacity * 2)
        .toRgbString()};
  }
`;

type ILink = React.ComponentType<JuiLinkProps>;
const JuiLink: ILink = React.memo(
  ({ Component, handleOnClick, ...rest }: JuiLinkProps) => {
    const { size, ...componentRest } = rest;
    return Component ? (
      <Component {...componentRest}>
        <StyledComponent onClick={handleOnClick} {...rest} />
      </Component>
    ) : null;
  },
);

const typographySizeMap: { [key in Size]: keyof Theme['typography'] } = {
  small: 'caption1',
  medium: 'body2',
  large: 'headline',
};

JuiLink.defaultProps = {
  size: 'medium',
  color: 'primary',
  disabled: false,
  Component: 'a',
};

export { JuiLink, JuiLinkProps };
export default JuiLink;
