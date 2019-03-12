/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-08 10:29:42
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';
<<<<<<< HEAD
import { width, shape } from '../../foundation/utils/styles';
=======
import { width, shape, grey } from '../../foundation/utils/styles';
// import { preloadImg } from '../../foundation/utils';
>>>>>>> hotfix/1.1.1.190305
import { JuiIconography } from '../../foundation/Iconography';

type JuiThumbnailProps = {
  size?: 'small' | 'large';
  style?: React.CSSProperties;
};

type JuiThumbnailWithUrlProps = {
  url: string;
} & JuiThumbnailProps;
<<<<<<< HEAD

type JuiThumbnailWithIconProps = {
  iconType: string;
} & JuiThumbnailProps;
=======

type JuiThumbnailWithIconProps = {
  iconType: string;
} & JuiThumbnailProps;

const WrappedMuiIcon = ({
  iconType,
  size,
  ...rest
}: JuiThumbnailWithIconProps & { children: string }) => (
  <JuiIconography {...rest} />
);

const StyledIcon = styled(WrappedMuiIcon)`
  && {
    font-size: ${({ size }) => (size === 'small' ? width(5) : width(9))};
  }
`;
>>>>>>> hotfix/1.1.1.190305

const StyledModifyImage = styled<JuiThumbnailWithUrlProps, 'span'>('span')`
  width: ${({ size }) => (size === 'small' ? width(5) : width(9))};
  height: ${({ size }) => (size === 'small' ? width(5) : width(9))};
  border-radius: ${({ size }) =>
    size === 'small' ? shape('borderRadius', 0.5) : shape('borderRadius')};
  background-color: ${grey('100')};
  background-image: url(${({ url }) => url});
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
`;

class JuiThumbnail extends React.PureComponent<
  JuiThumbnailWithUrlProps | JuiThumbnailWithIconProps
> {
  render() {
    const { size, style, url, iconType } = this
      .props as JuiThumbnailWithIconProps & JuiThumbnailWithUrlProps;

    return (
      <>
        {url ? (
          <StyledModifyImage url={url} style={style} />
        ) : (
<<<<<<< HEAD
          <JuiIconography iconSize={size === 'small' ? 'small' : 'extraLarge'}>
=======
          <StyledIcon size={size} iconType={iconType}>
>>>>>>> hotfix/1.1.1.190305
            {iconType}
          </JuiIconography>
        )}
      </>
    );
  }
}

export { JuiThumbnail };
