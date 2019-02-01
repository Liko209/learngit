/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-08 10:29:42
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';
import { width, shape } from '../../foundation/utils/styles';
// import { preloadImg } from '../../foundation/utils';
import { JuiIconography } from '../../foundation/Iconography';

type JuiThumbnailProps = {
  size?: 'small' | 'large';
  url?: string;
  iconType?: string;
  style?: React.CSSProperties;
};

const WrappedMuiIcon = ({
  iconType,
  size,
  url,
  ...rest
}: JuiThumbnailProps) => <JuiIconography {...rest} />;

const StyledIcon = styled(WrappedMuiIcon)<JuiThumbnailProps>`
  && {
    font-size: ${({ size }) => (size === 'small' ? width(5) : width(9))};
  }
`;

const StyledModifyImage = styled<JuiThumbnailProps, 'span'>('span')`
  width: ${({ size }) => (size === 'small' ? width(5) : width(9))};
  height: ${({ size }) => (size === 'small' ? width(5) : width(9))};
  border-radius: ${({ size }) =>
    size === 'small' ? shape('borderRadius', 0.5) : shape('borderRadius')};
  background-image: url(${({ url }) => url});
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
`;

class JuiThumbnail extends React.Component<JuiThumbnailProps> {
  render() {
    const { size, url, iconType, style } = this.props;

    return (
      <>
        {url ? (
          <StyledModifyImage url={url} style={style} />
        ) : (
          <StyledIcon size={size} {...this.props}>
            {iconType}
          </StyledIcon>
        )}
      </>
    );
  }
}

export { JuiThumbnail };
