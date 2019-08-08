import * as React from 'react';
import tinycolor from 'tinycolor2';
import styled from '../../foundation/styled-components';
import { typography, palette, grey } from '../../foundation/shared/theme';

import { Palette } from '../../foundation/styles';

type Size = 'small' | 'medium' | 'large';

type RuiLinkProps = {
  size?: Size;
  disabled?: boolean;
  underline?: boolean;
  color?: 'primary' | 'secondary' | 'white';
  Component?: React.ComponentType | keyof JSX.IntrinsicElements;
  handleOnClick?:
    | ((event: React.MouseEvent<HTMLSpanElement>) => void)
    | undefined;
};

const colorMap: {
  [x: string]: [keyof Palette, any];
} = {
  primary: ['primary', 'main'],
  secondary: ['secondary', 'main'],
  white: ['common', 'white'],
};

const StyledComponent = styled('span')<RuiLinkProps>`
  ${({ size }) => (size ? typography[typographySizeMap[size]] : '')}
  color: ${({ disabled, color = 'primary' }) =>
    disabled ? grey(500) : palette(colorMap[color][0], colorMap[color][1])};
  ${({ underline }) => (underline ? 'text-decoration: underline' : null)}

  &:hover {
    color: ${({ theme, color }) =>
      color === 'white' ? null : theme.palette.primary.dark};
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  }
  &:active {
    color: ${({ theme, color = 'primary' }) =>
      tinycolor(palette(colorMap[color][0], colorMap[color][1])({ theme }))
        .setAlpha(1 - theme.palette.action.hoverOpacity * 2)
        .toRgbString()};
  }
  pointer-events: auto;
`;

type ILink = React.ComponentType<RuiLinkProps>;
const RuiLink: ILink = React.memo(
  ({ Component, handleOnClick, ...rest }: RuiLinkProps) => {
    const { size, ...componentRest } = rest;
    return Component ? (
      <Component {...componentRest}>
        <StyledComponent onClick={handleOnClick} {...rest} />
      </Component>
    ) : null;
  },
);

const typographySizeMap = {
  small: 'caption1',
  medium: 'body2',
  large: 'headline',
};

RuiLink.defaultProps = {
  size: 'medium',
  color: 'primary',
  disabled: false,
  Component: 'a',
};

export { RuiLink, RuiLinkProps };
export default RuiLink;
