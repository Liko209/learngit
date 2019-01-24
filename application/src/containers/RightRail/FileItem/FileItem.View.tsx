/*
 * @Author: isaac.liu
 * @Date: 2019-01-08 14:24:54
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  JuiListItemText,
  JuiListItemWithHover,
  JuiListItemIcon,
} from 'jui/components/Lists';
import { Thumbnail } from '@/containers/Thumbnail';
import { FileName } from 'jui/pattern/ConversationCard/Files/FileName';
import { FileItemViewProps } from './types';
import { Download } from '../common/Download.View';
import { SecondaryText } from '../common/SecondaryText.View';

@observer
class FileItemView extends Component<FileItemViewProps> {
  private _renderItem = (hover: boolean) => {
    const { file, personName, createdTime, downloadUrl, id } = this.props;
    const fileInfo = file || {};
    const { name } = fileInfo;

    return (
      <>
        <JuiListItemIcon>
          <Thumbnail id={id} />
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
        data-test-automation-id="rightRail-file-item"
      />
    );
  }
}

export { FileItemView };
