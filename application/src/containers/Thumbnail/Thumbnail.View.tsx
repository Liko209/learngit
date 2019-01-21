/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-21 13:31:38
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { JuiThumbnail } from 'jui/components/Thumbnail';
import { ViewProps } from './types';

@observer
class ThumbnailView extends React.Component<ViewProps> {
  render() {
    const { fileTypeOrUrl } = this.props;
    return (
      <JuiThumbnail iconType={fileTypeOrUrl.icon} url={fileTypeOrUrl.url} />
    );
  }
}

export { ThumbnailView };
