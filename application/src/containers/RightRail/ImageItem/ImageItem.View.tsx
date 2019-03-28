/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-15 11:07:53
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  JuiListItemText,
  JuiListItemWithHover,
  JuiListItemIcon,
  JuiListItemSecondaryAction,
} from 'jui/components/Lists';
import { Thumbnail } from '@/containers/Thumbnail';
import { FileName } from 'jui/pattern/ConversationCard/Files/FileName';
import { ImageItemViewProps } from './types';
import { Download } from '@/containers/common/Download';
import { SecondaryText } from '../common/SecondaryText.View';

@observer
class ImageItemView extends Component<ImageItemViewProps> {
  private _renderItem = (hover: boolean) => {
    const { fileName, id, personName, createdTime, downloadUrl } = this.props;
    return (
      <>
        <JuiListItemIcon>
          <Thumbnail id={id} type="image" />
        </JuiListItemIcon>
        <JuiListItemText
          primary={<FileName filename={fileName} />}
          secondary={
            <SecondaryText personName={personName} createdTime={createdTime} />}
        />
        {hover && (
          <JuiListItemSecondaryAction>
            <Download url={downloadUrl} />
          </JuiListItemSecondaryAction>
        )}
      </>
    );
  }

  render() {
    const { file } = this.props;
    if (file.isMocked || file.id < 0) {
      return <></>;
    }
    return (
      <JuiListItemWithHover
        render={this._renderItem}
        data-test-automation-id="rightRail-image-item"
      />
    );
  }
}

export { ImageItemView };
