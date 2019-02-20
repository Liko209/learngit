/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-08 10:29:42
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';
import { width, shape } from '../../foundation/utils/styles';
import { JuiIconography } from '../../foundation/Iconography';
import { Omit } from '../../foundation/utils/typeHelper';

type JuiThumbnailProps = {
  size?: 'small' | 'large';
  url?: string;
  iconType: string;
  style?: React.CSSProperties;
};

const WrappedMuiIcon = ({
  iconType,
  size,
  url,
  ...rest
}: JuiThumbnailProps & { children: string }) => <JuiIconography {...rest} />;

const StyledIcon = styled(WrappedMuiIcon)<JuiThumbnailProps>`
  && {
    font-size: ${({ size }) => (size === 'small' ? width(5) : width(9))};
  }
`;

const StyledModifyImage = styled<Omit<JuiThumbnailProps, 'iconType'>, 'span'>(
  'span',
)`
  width: ${({ size }) => (size === 'small' ? width(5) : width(9))};
  height: ${({ size }) => (size === 'small' ? width(5) : width(9))};
  border-radius: ${({ size }) =>
    size === 'small' ? shape('borderRadius', 0.5) : shape('borderRadius')};
  background-image: url(${({ url }) => url});
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
`;

class JuiThumbnail extends React.PureComponent<JuiThumbnailProps> {
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
