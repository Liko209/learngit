/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-21 13:31:38
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { JuiThumbnail } from 'jui/components/Thumbnail';
import { JuiIconography } from 'jui/foundation/Iconography';
import { PreloadImg } from '@/containers/common';
import { ViewProps, Props } from './types';
import { accelerateURL } from '@/common/accelerateURL';

@observer
class ThumbnailView extends React.Component<ViewProps & Props> {
  private static _placeHolder = (
    <JuiIconography iconSize="extraLarge">image_preview</JuiIconography>
  );

  private _renderIcon = () => {
    const { thumbsUrlWithSize, onClick } = this.props;
    if (!thumbsUrlWithSize) {
      return ThumbnailView._placeHolder;
    }
    const url = accelerateURL(thumbsUrlWithSize) || thumbsUrlWithSize;
    return (
      <PreloadImg url={url} placeholder={ThumbnailView._placeHolder}>
        <JuiThumbnail url={url} onClick={onClick} />
      </PreloadImg>
    );
  };

  render() {
    const { icon, type, onClick } = this.props;
    return type === 'image' ? (
      this._renderIcon()
    ) : (
      <JuiThumbnail iconType={icon} onClick={onClick} />
    );
  }
}

export { ThumbnailView };
