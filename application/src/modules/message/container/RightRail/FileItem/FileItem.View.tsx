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
  JuiListItemSecondaryAction,
} from 'jui/components/Lists';
import { JuiLeftRailListItemIcon } from 'jui/pattern/LeftRail';
import { Thumbnail } from '@/modules/message/container/Thumbnail';
import { FileName } from 'jui/pattern/ConversationCard/Files/FileName';
import {
  isSupportFileViewer,
  isFileReadyForViewer,
} from '@/common/getFileType';
import { FileItemViewProps } from './types';
import { Download } from '@/containers/common/Download';
import { SecondaryText } from '../common/SecondaryText.View';
import { JuiButtonBar } from 'jui/components/Buttons';
import { FileActionMenu } from '@/containers/common/fileAction';
import { postParser } from '@/common/postParser';

@observer
class FileItemView extends Component<FileItemViewProps> {
  private _renderItem = () => {
    const { file, personName, modifiedTime, downloadUrl, id } = this.props;
    const fileInfo = file || {};
    const { name, status, type } = fileInfo;
    const supportFileViewer = isSupportFileViewer(type);
    const fileReadyForViewer = isFileReadyForViewer(status);
    return (hover: boolean) => {
      return (
        <>
          <JuiLeftRailListItemIcon
            disabled={supportFileViewer && !fileReadyForViewer}
          >
            <Thumbnail id={id} type="file" />
          </JuiLeftRailListItemIcon>
          <JuiListItemText
            primary={
              <FileName>
                {postParser(name, {
                  fileName: true,
                })}
              </FileName>
            }
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
    };
  }

  render() {
    return (
      <JuiListItemWithHover
        render={this._renderItem()}
        data-test-automation-id="rightRail-file-item"
      />
    );
  }
}

export { FileItemView };
