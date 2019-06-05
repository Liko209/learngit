/*
 * @Author: isaac.liu
 * @Date: 2019-01-08 14:24:54
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { container } from 'framework';
import {
  JuiListItemText,
  JuiListItemWithHover,
  JuiListItemIcon,
  JuiListItemSecondaryAction,
} from 'jui/components/Lists';
import { Thumbnail } from '@/modules/message/container/Thumbnail';
import { FileName } from 'jui/pattern/ConversationCard/Files/FileName';
import { FileItemViewProps } from './types';
import { Download } from '@/containers/common/Download';
import { SecondaryText } from '../common/SecondaryText.View';
import { JuiButtonBar } from 'jui/components/Buttons';
import { FileActionMenu } from '@/containers/common/fileAction';
import { IViewerService, VIEWER_SERVICE } from '@/modules/viewer/interface';
import FileItemModel from '@/store/models/FileItem';

@observer
class FileItemView extends Component<FileItemViewProps> {
  _viewerService: IViewerService = container.get(VIEWER_SERVICE);

  private _handleFileClick = (item: FileItemModel) => () => {
    this._viewerService.showFileViewer(item);
  }
  private _renderItem = (hover: boolean) => {
    const { file, personName, modifiedTime, downloadUrl, id } = this.props;
    const fileInfo = file || {};
    const { name } = fileInfo;

    return (
      <>
        <JuiListItemIcon>
          <Thumbnail
            id={id}
            type="file"
            onClick={this._handleFileClick(file)}
          />
        </JuiListItemIcon>
        <JuiListItemText
          primary={<FileName filename={name} />}
          secondary={<SecondaryText name={personName} time={modifiedTime} />}
        />
        {hover && (
          <JuiListItemSecondaryAction>
            <JuiButtonBar overlapSize={-2}>
              <Download url={downloadUrl} />
              <FileActionMenu fileId={id} disablePortal={true} />
            </JuiButtonBar>
          </JuiListItemSecondaryAction>
        )}
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
