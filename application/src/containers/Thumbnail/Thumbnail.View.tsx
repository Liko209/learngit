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
import { ViewProps } from './types';

@observer
class ThumbnailView extends React.Component<ViewProps> {
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
            <JuiThumbnail url={url} iconType={''} />
          </PreloadImg>
        ) : (
          <JuiThumbnail iconType={icon} />
        )}
      </>
    );
  }
}

export { ThumbnailView };
