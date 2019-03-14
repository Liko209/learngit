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
  grey,
} from '../../foundation/utils/styles';
import { Omit } from '../../foundation/utils/typeHelper';
import { Theme } from '../../foundation/theme/theme';

type Size = 'small' | 'medium' | 'large' | 'xlarge';

type JuiAvatarProps = {
  size?: Size;
  color?: string;
  presence?: JSX.Element;
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

const StyledAvatar = styled<JuiAvatarProps>(MuiAvatar)`
  && {
    width: ${({ size = 'medium' }) => width(sizes[size])};
    height: ${({ size = 'medium' }) => height(sizes[size])};
    ${({ size = 'medium' }) => typography(fonts[size])};
    background-color: ${({ color }) =>
      color ? palette('avatar', color) : grey('100')};
    &:hover {
      opacity: ${({ theme }) => 1 - theme.palette.action.hoverOpacity};
      cursor: pointer;
    }
    &:active {
      opacity: ${({ theme }) => 1 - 2 * theme.palette.action.hoverOpacity};
    }
  }
`;

const StyledPresenceWrapper = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
`;

const JuiAvatar: React.SFC<JuiAvatarProps> = memo((props: JuiAvatarProps) => {
  const { presence, style, size } = props;

  return presence ? (
    <StyledWrapper size={size} style={style}>
      <StyledAvatar {...props} />
      <StyledPresenceWrapper>{presence}</StyledPresenceWrapper>
    </StyledWrapper>
  ) : (
    <StyledAvatar {...props} />
  );
});

JuiAvatar.defaultProps = {
  size: 'medium',
};
JuiAvatar.displayName = 'JuiAvatar';

export { JuiAvatarProps, JuiAvatar };
