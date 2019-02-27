/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-08 10:29:42
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';
import { width, shape } from '../../foundation/utils/styles';
import { JuiIconography } from '../../foundation/Iconography';

type JuiThumbnailProps = {
  size?: 'small' | 'large';
  style?: React.CSSProperties;
};

type JuiThumbnailWithUrlProps = {
  url: string;
} & JuiThumbnailProps;

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

const StyledModifyImage = styled<JuiThumbnailWithUrlProps, 'span'>('span')`
  width: ${({ size }) => (size === 'small' ? width(5) : width(9))};
  height: ${({ size }) => (size === 'small' ? width(5) : width(9))};
  border-radius: ${({ size }) =>
    size === 'small' ? shape('borderRadius', 0.5) : shape('borderRadius')};
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
          <StyledIcon size={size} iconType={iconType}>
            {iconType}
          </StyledIcon>
        )}
      </>
    );
  }
}

export { JuiThumbnail };
