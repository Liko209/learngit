/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:24:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import tinycolor from 'tinycolor2';
import styled, { Dependencies } from '../../foundation/styled-components';
import { typography, palette, grey } from '../../foundation/utils/styles';

type JuiLinkProps = {
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  color?: 'primary' | 'secondary';
  Component?: React.ComponentType | keyof JSX.IntrinsicElements;
  href?: string;
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

type ILink = React.ComponentType<JuiLinkProps> & Dependencies;
const JuiLink: ILink = ({ Component, ...rest }: JuiLinkProps) => {
  return Component ? (
    <Component {...rest}>
      <StyledComponent {...rest} />
    </Component>
  ) : null;
};

const typographySizeMap = {
  small: 'caption',
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
