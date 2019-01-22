/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-15 11:07:53
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import {
  JuiListItemText,
  JuiListItemWithHover,
  JuiListItemIcon,
} from 'jui/components/Lists';
import { JuiThumbnail } from 'jui/components/Thumbnail';
import { JuiIconography } from 'jui/foundation/Iconography';
import { FileName } from 'jui/pattern/ConversationCard/Files/FileName';
import { ImageItemViewProps } from './types';
import { Download } from '../Download.View';
import { SecondaryText } from '../SecondaryText.View';

class ImageItemView extends Component<ImageItemViewProps> {
  private _renderItem = (hover: boolean) => {
    const { file, url, personName, createdTime } = this.props;
    const { name, downloadUrl } = file;
    return (
      <>
        <JuiListItemIcon>
          {url ? (
            <JuiThumbnail url={url} />
          ) : (
            <JuiIconography fontSize="large">image_preview</JuiIconography>
          )}
        </JuiListItemIcon>
        <JuiListItemText
          primary={<FileName filename={name} />}
          secondary={
            <SecondaryText personName={personName} createdTime={createdTime} />}
        />
        {hover && <Download url={downloadUrl} />}
      </>
    );
  }

  render() {
    return (
      <JuiListItemWithHover
        render={this._renderItem}
        data-test-automation-id="rightRail-image-item"
      />
    );
  }
}

export { ImageItemView };
