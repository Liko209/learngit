/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-17 10:25:50
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import MuiAvatar, {
  AvatarProps as MuiAvatarProps,
} from '@material-ui/core/Avatar';
import { typography, palette, opacity } from '../../foundation/shared/theme';
import dataColors from '../../foundation/shared/colors.json';
import { Theme } from '../../foundation/styles';

type Size = 'xs' | 'sm' | 'md' | 'lg';

type AvatarProps = {
  size: Size;
  color?: string;
  presence?: JSX.Element;
};

type RuiAvatarProps = AvatarProps & MuiAvatarProps;

const avatarSize = {
  xs: '24px',
  sm: '32px',
  md: '40px',
  lg: '80px',
};

const fonts: { [key in Size]: keyof Theme['typography'] } = {
  lg: 'display1',
  md: 'subheading2',
  sm: 'subheading2',
  xs: 'caption2',
};

const StyledWrapper = styled.div<{ size: Size }>`
  width: ${({ size }) => avatarSize[size]};
  height: ${({ size }) => avatarSize[size]};
  position: relative;
`;

const StyledAvatar = styled(MuiAvatar)<RuiAvatarProps>`
  && {
    background-color: ${({ color }) =>
      color ? dataColors[color] : palette('common', 'white')};
    width: ${({ size }) => avatarSize[size]};
    height: ${({ size }) => avatarSize[size]};
    ${({ size }) => typography(fonts[size])};
    &:hover {
      opacity: ${opacity('8')};
      cursor: pointer;
    }
    &:active {
      opacity: ${opacity('6')};
    }
  }
` as typeof MuiAvatar;

const StyledPresenceWrapper = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
`;

class RuiAvatar extends PureComponent<RuiAvatarProps> {
  static defaultProps = {
    size: 'md',
  };

  render() {
    const { presence, size } = this.props;

    return presence ? (
      <StyledWrapper size={size}>
        <StyledAvatar {...this.props} />
        <StyledPresenceWrapper>{presence}</StyledPresenceWrapper>
      </StyledWrapper>
    ) : (
      <StyledAvatar {...this.props} />
    );
  }
}

export { RuiAvatarProps, RuiAvatar };
