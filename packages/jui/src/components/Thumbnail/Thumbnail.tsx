/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-08 10:29:42
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { grey } from '../../foundation/utils/styles';
import { JuiIconography } from '../../foundation/Iconography';
import { Theme } from '../../foundation/theme/theme';

type baseProps = {
  size?: 'small' | 'large';
  style?: React.CSSProperties;
  onClick?: (event: React.MouseEvent) => void;
};

type JuiThumbnailWithUrlProps = {
  url: string;
} & baseProps;

type JuiThumbnailWithIconProps = {
  iconType: string;
} & baseProps;

type JuiThumbnailProps = JuiThumbnailWithUrlProps | JuiThumbnailWithIconProps;

const StyledModifyImage = styled<JuiThumbnailWithUrlProps, 'span'>(
  'span',
).attrs({
  style: ({
    size,
    theme,
    url,
  }: JuiThumbnailWithUrlProps & { theme: Theme }) => {
    const { width, height } = theme.size;
    return {
      width: size === 'small' ? 5 * width : 9 * width,
      height: size === 'small' ? 5 * height : 9 * height,
      backgroundImage: `url(${url})`,
      borderRadius:
        size === 'small'
          ? 0.5 * theme.shape['borderRadius']
          : theme.shape['borderRadius'],
    };
  },
})`
  background-color: ${grey('100')};
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'auto')};
`;

class JuiThumbnail extends React.PureComponent<JuiThumbnailProps> {
  render() {
    const hasUrl = (props: any): props is JuiThumbnailWithUrlProps => {
      return props.url;
    };
    let url: string = '';
    let iconType: string = '';
    const { size, onClick } = this.props;

    if (hasUrl(this.props)) {
      ({ url } = this.props);
    } else {
      ({ iconType } = this.props);
    }

    return (
      <>
        {url ? (
          <StyledModifyImage
            url={url}
            onClick={onClick}
            data-test-automation-id="thumbnail"
          />
        ) : (
          <JuiIconography
            iconSize={size === 'small' ? 'small' : 'extraLarge'}
            onClick={onClick}
          >
            {iconType}
          </JuiIconography>
        )}
      </>
    );
  }
}

export { JuiThumbnail };
