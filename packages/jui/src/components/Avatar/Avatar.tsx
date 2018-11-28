/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-17 10:25:50
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import MuiAvatar, {
  AvatarProps as MuiAvatarProps,
} from '@material-ui/core/Avatar';
import {
  width,
  height,
  typography,
  palette,
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
  xlarge: 'title2',
  large: 'title2',
  medium: 'subheading3',
  small: 'caption2',
};

const StyledWrapper = styled.div`
  height: ${height(10)};
  width: ${width(10)};
  position: relative;
`;

const StyledAvatar = styled<JuiAvatarProps>(MuiAvatar)`
  && {
    width: ${({ size = 'medium', theme }) => width(sizes[size])({ theme })};
    height: ${({ size = 'medium', theme }) => height(sizes[size])({ theme })};
    ${({ size = 'medium' }) => typography(fonts[size])};
    background-color: ${({ color }) =>
      color ? palette('avatar', color) : palette('common', 'white')};
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
  height: ${height(3.5)};
  width: ${width(3.5)};
  position: absolute;
  bottom: 0;
  right: 0;
`;

const JuiAvatar = (props: JuiAvatarProps) => {
  const { presence } = props;

  return presence ? (
    <StyledWrapper>
      <StyledAvatar {...props} />
      <StyledPresenceWrapper>{presence}</StyledPresenceWrapper>
    </StyledWrapper>
  ) : (
    <StyledAvatar {...props} />
  );
};

JuiAvatar.defaultProps = {
  size: 'medium',
};
JuiAvatar.displayName = 'JuiAvatar';
JuiAvatar.dependencies = [MuiAvatar];
export { JuiAvatarProps, JuiAvatar };
