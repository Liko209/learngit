/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-17 10:25:50
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../foundation/styled-components';
import MuiAvatar, {
  AvatarProps as MuiAvatarProps,
} from '@material-ui/core/Avatar';
import {
  width,
  height,
  typography,
  palette,
  spacing,
  primary,
} from '../../foundation/utils/styles';
import { Omit } from '../../foundation/utils/typeHelper';
import { Theme } from '../../foundation/theme/theme';
import { RuiTooltip } from 'rcui/components/Tooltip';
import { JuiIconography, SvgSymbol } from '../../foundation/Iconography';
import { useHoverHelper } from '../../foundation/hooks/useHoverHelper';
import { StyledMaskWrapper, StyledMask } from './Mask';

type Size = 'small' | 'medium' | 'large' | 'xlarge';

type JuiAvatarProps = {
  size?: Size;
  color?: string;
  tooltip?: string;
  presence?: JSX.Element;
  cover?: boolean;
  mask?: boolean;
  displayName?: string;
  customColor?: boolean;
  iconSymbol?: SvgSymbol;
} & Omit<MuiAvatarProps, 'innerRef'>;

const sizes: { [key in Size]: number } = {
  xlarge: 20,
  large: 10,
  medium: 8,
  small: 6,
};

const fonts: { [key in Size]: keyof Theme['typography'] } = {
  xlarge: 'display1',
  large: 'subheading2',
  medium: 'subheading2',
  small: 'caption2',
};

const StyledWrapper = styled.div<{ size?: Size }>`
  width: ${({ size = 'medium' }) => width(sizes[size])};
  height: ${({ size = 'medium' }) => height(sizes[size])};
  position: relative;
`;

const StyledAvatar = styled<JuiAvatarProps>(({ customColor, ...rest }) => (
  <MuiAvatar {...rest} />
))`
  && {
    width: ${({ size = 'medium' }) => width(sizes[size])};
    height: ${({ size = 'medium' }) => height(sizes[size])};
    ${({ size = 'medium' }) => typography(fonts[size])};
    background-color: ${({ color, customColor }) =>
      customColor
        ? color
        : color
        ? palette('avatar', color)
        : primary('light')};
    &:hover {
      opacity: ${({ theme }) => 1 - theme.palette.action.hoverOpacity};
      cursor: pointer;
    }
    &:active {
      opacity: ${({ theme }) => 1 - 2 * theme.palette.action.hoverOpacity};
    }
  }

  &:focus {
    outline: none;
  }

  > .avatar-short-name {
    display: flex;
    height: 100%;
    width: 100%;
    justify-content: center;
    align-items: center;
  }
`;

const StyledCoverAvatar = styled<JuiAvatarProps>(MuiAvatar)`
  && {
    width: ${width(70)};
    height: ${height(55)};
    border-radius: unset;
    position: static;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${spacing(12)};
    color: ${({ color }) =>
      color ? palette('avatar', color) : primary('main')};
    background-color: ${({ color }) =>
      color ? palette('avatar', color) : primary('main')};
  }

  &:focus {
    outline: none;
  }
`;
const StyledCoverAvatarContent = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  height: ${height(33)};
  width: ${width(33)};
  border-radius: 50%;
  background-color: ${palette('common', 'white')};
`;
const StyledIconAvatar = styled(({ size, ...rest }: any) => (
  <JuiIconography iconSize="inherit" iconColor={['grey', '100']} {...rest} />
))<{ size: Size; symbol: SvgSymbol }>`
  font-size: ${({ size }) => sizes[size] * 4}px;
  background-color: ${palette('primary', 'light')};
`;

const StyledPresenceWrapper = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
`;

const JuiAvatarMask = (props: JuiAvatarProps) => {
  const { onClick, children } = props;
  return (
    <StyledMaskWrapper onClick={onClick}>
      {children}
      <StyledMask>
        <JuiIconography iconSize="small" color="common.white">
          edit
        </JuiIconography>
      </StyledMask>
    </StyledMaskWrapper>
  );
};
JuiAvatarMask.displayName = 'JuiAvatarMask';

const JuiAvatar: React.SFC<JuiAvatarProps> = memo((props: JuiAvatarProps) => {
  const {
    tooltip,
    cover,
    mask,
    presence,
    displayName,
    children,
    iconSymbol,
    ...rest
  } = props;
  const hoverHelper = useHoverHelper();

  let avatar: JSX.Element;
  const hoverTriggerProps = tooltip ? hoverHelper.TriggerProps : {};

  if (cover) {
    avatar = (
      <StyledCoverAvatar {...rest} {...hoverTriggerProps}>
        <StyledCoverAvatarContent>{children}</StyledCoverAvatarContent>
      </StyledCoverAvatar>
    );
  } else {
    let iconChildren;
    if (iconSymbol) {
      iconChildren = (
        <StyledIconAvatar size={rest.size || 'medium'} symbol={iconSymbol} />
      );
    }

    avatar = (
      <StyledAvatar {...rest} {...hoverTriggerProps}>
        {iconChildren || children}
      </StyledAvatar>
    );
    if (presence) {
      avatar = (
        <StyledWrapper size={rest.size} style={rest.style}>
          {avatar}
          <StyledPresenceWrapper>{presence}</StyledPresenceWrapper>
        </StyledWrapper>
      );
    }
  }

  if (mask) {
    avatar = <JuiAvatarMask onClick={rest.onClick}>{avatar}</JuiAvatarMask>;
  }

  if (tooltip && hoverHelper.hovered) {
    avatar = <RuiTooltip title={tooltip}>{avatar}</RuiTooltip>;
  }

  return avatar;
});

JuiAvatar.defaultProps = {
  size: 'medium',
  cover: false,
};
JuiAvatar.displayName = 'JuiAvatar';

export { JuiAvatarProps, JuiAvatar, StyledAvatar };
