/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-17 10:25:50
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../styled-components';
import MuiAvatar, { AvatarProps } from '@material-ui/core/Avatar';
import { width, height, typography, palette } from '../../utils/styles';

type TAvatarProps = {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  color?: string;
} & AvatarProps;

const sizes = {
  xlarge: 20,
  large: 10,
  medium: 8,
  small: 6,
};

const fonts = {
  xlarge: 'title2',
  large: 'title2',
  medium: 'subheading2',
  small: 'caption2',
};

const StyledAvatar = styled<TAvatarProps>(MuiAvatar)`
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

const Avatar: React.SFC<TAvatarProps> = (props: TAvatarProps) => {
  const { innerRef, ...rest } = props;

  return (
    <StyledAvatar {...rest} />
  );
};

Avatar.defaultProps = {
  size: 'medium',
  color: 'lake',
};

export { TAvatarProps, Avatar };

export default Avatar;
