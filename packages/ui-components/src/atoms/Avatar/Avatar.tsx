/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-17 10:25:50
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../styled-components';
import MuiAvatar, { AvatarProps as MuiAvatarProps } from '@material-ui/core/Avatar';
import { width, height, typography, palette } from '../../utils/styles';

type AvatarProps = {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  color?: string;
} & MuiAvatarProps;

const sizes = {
  xlarge: 8,
  large: 4,
  medium: 3.2,
  small: 2.4,
};

const fonts = {
  xlarge: 'title2',
  large: 'title2',
  medium: 'subheading2',
  small: 'caption2',
};

const StyledAvatar = styled<AvatarProps>(MuiAvatar)`
  && {
    width: ${({ size = 'medium', theme }) => width(sizes[size])({ theme })};
    height: ${({ size = 'medium', theme }) => height(sizes[size])({ theme })};
    ${({ size = 'medium' }) => typography(fonts[size])};
    background-color: ${({ color = 'lake' }) => palette('accent', color)}
    &:hover {
      opacity: ${({ theme }) => 1 - theme.palette.action.hoverOpacity};
      cursor: pointer;
    }
    &:active {
      opacity: ${({ theme }) => 1 - 2 * theme.palette.action.hoverOpacity};
    }
  }
`;

const Avatar: React.SFC<AvatarProps> = (props: AvatarProps) => {
  const { innerRef, ...rest } = props;

  return (
    <StyledAvatar {...rest} />
  );
};

Avatar.defaultProps = {
  size: 'medium',
  color: 'lake',
};

const JuiAvatar = styled(Avatar)``;

export { AvatarProps, JuiAvatar };

export default JuiAvatar;
