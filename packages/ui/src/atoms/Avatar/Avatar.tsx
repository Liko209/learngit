/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-17 10:25:50
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../styled-components';
import MuiAvatar, { AvatarProps } from '@material-ui/core/Avatar';

type TAvatarProps = {
  size?: 'small' | 'medium' | 'large';
} & AvatarProps;

const sizes = {
  large: 10,
  medium: 8,
  small: 6,
};

// const MuiAvatarWrapper = ({ ...props }: TAvatarProps) => (
//   <MuiAvatar {...props} />
// );

const StyledAvatar = styled<TAvatarProps>(MuiAvatar)`
  && {
    width: ${({ size, theme }) => `${sizes[`${size}`] * theme.spacing.unit}px`};
    height: ${({ size, theme }) => `${sizes[`${size}`] * theme.spacing.unit}px`};
    &:hover {
      opacity: ${({ theme }) => 1 - theme.palette.action.hoverOpacity};
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
};

export { TAvatarProps, Avatar };

export default Avatar;
