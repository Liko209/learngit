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
  render() {
    const { icon, thumbsUrlWithSize, type, handleClick } = this.props;
    return (
      <>
        {type === 'image' ? (
          <PreloadImg
            url={thumbsUrlWithSize}
            placeholder={
              <JuiIconography iconSize="extraLarge">
                image_preview
              </JuiIconography>
            }
          >
            <JuiThumbnail url={thumbsUrlWithSize} handleClick={handleClick} />
          </PreloadImg>
        ) : (
          <JuiThumbnail iconType={icon} />
        )}
      </>
    );
  }
}

export { ThumbnailView };
