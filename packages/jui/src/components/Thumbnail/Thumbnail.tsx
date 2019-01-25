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

const ICON_MAP = {
  pdf: 'pdf',
  ppt: 'ppt',
  ps: 'ps',
  sheet: 'sheet',
};

type JuiThumbnailProps = {
  size?: 'small' | 'large';
  url?: string;
  iconType?: string;
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

const StyledModifyImage = styled<JuiThumbnailProps, 'img'>('img')`
  width: ${({ size }) => (size === 'small' ? width(5) : width(9))};
  height: ${({ size }) => (size === 'small' ? width(5) : width(9))};
  border-radius: ${({ size }) =>
    size === 'small' ? shape('borderRadius', 0.5) : shape('borderRadius')};
`;

class JuiThumbnail extends React.Component<JuiThumbnailProps> {
  render() {
    const { size, url, iconType } = this.props;

    return (
      <>
        {url ? (
          <StyledModifyImage src={url} />
        ) : (
          <StyledIcon size={size} {...this.props}>
            {iconType ? ICON_MAP[iconType] : 'image_preview'}
          </StyledIcon>
        )}
      </>
    );
  }
}

export { JuiThumbnail };
