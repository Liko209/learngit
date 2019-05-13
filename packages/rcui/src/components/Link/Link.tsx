import * as React from 'react';
import tinycolor from 'tinycolor2';
import styled from '../../foundation/styled-components';
import { typography, palette } from '../../foundation/shared/theme';

type Size = 'small' | 'medium' | 'large';

type RuiLinkProps = {
  size?: Size;
  disabled?: boolean;
  color?: 'primary' | 'secondary';
  Component?: React.ComponentType | keyof JSX.IntrinsicElements;
  handleOnClick?:
    | ((event: React.MouseEvent<HTMLSpanElement>) => void)
    | undefined;
};

const StyledComponent = styled('span')<RuiLinkProps>`
  ${({ size }) => (size ? typography[typographySizeMap[size]] : '')}
  color: ${({ disabled, color = 'primary', theme }) =>
    disabled ? theme.palette.grey[500] : theme.palette[color]['main']};
  &:hover {
    color: ${({ theme }) => theme.palette.primary.dark};
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  }
  &:active {
    color: ${({ theme, color = 'primary' }) =>
      tinycolor(palette(color, 'main')({ theme }))
        .setAlpha(1 - theme.palette.action.hoverOpacity * 2)
        .toRgbString()};
  }
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
