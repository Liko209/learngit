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
`;

class JuiThumbnail extends React.PureComponent<
  JuiThumbnailWithUrlProps | JuiThumbnailWithIconProps
> {
  render() {
    const { size, url, iconType } = this.props as JuiThumbnailWithIconProps &
      JuiThumbnailWithUrlProps;

    return (
      <>
        {url ? (
          <StyledModifyImage url={url} />
        ) : (
          <JuiIconography iconSize={size === 'small' ? 'small' : 'extraLarge'}>
            {iconType}
          </JuiIconography>
        )}
      </>
    );
  }
}

export { JuiThumbnail };
