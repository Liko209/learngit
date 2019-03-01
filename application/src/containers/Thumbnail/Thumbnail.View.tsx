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

@observer
class ThumbnailView extends React.Component<ViewProps & Props> {
  shouldComponentUpdate(nextProps: ViewProps & Props) {
    const {
      fileTypeOrUrl: { icon, url },
      type,
      id,
    } = nextProps;
    const current = this.props.fileTypeOrUrl;
    if (
      id === this.props.id &&
      icon === current.icon &&
      type === this.props.type
    ) {
      if (current.url) {
        return false;
      }
      return url !== current.url;
    }
    return true;
  }
  render() {
    const {
      fileTypeOrUrl: { icon, url },
      type,
    } = this.props;
    return (
      <>
        {type === 'image' ? (
          <PreloadImg
            url={url}
            placeholder={
              <JuiIconography fontSize="large">image_preview</JuiIconography>
            }
          >
            <JuiThumbnail url={url} />
          </PreloadImg>
        ) : (
          <JuiThumbnail iconType={icon} />
        )}
      </>
    );
  }
}

export { ThumbnailView };
