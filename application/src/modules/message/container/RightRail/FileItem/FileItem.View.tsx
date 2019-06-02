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
  JuiListItemSecondaryAction,
} from 'jui/components/Lists';
import { Thumbnail } from '@/modules/message/container/Thumbnail';
import { FileName } from 'jui/pattern/ConversationCard/Files/FileName';
import { FileItemViewProps } from './types';
import { Download } from '@/containers/common/Download';
import { SecondaryText } from '../common/SecondaryText.View';
import { JuiButtonBar } from 'jui/components/Buttons';
import { FileActionMenu } from '@/containers/common/fileAction';
import {
  postParser,
  SearchHighlightContext,
  HighlightContextInfo,
} from '@/common/postParser';

@observer
class FileItemView extends Component<FileItemViewProps> {
  static contextType = SearchHighlightContext;
  context: HighlightContextInfo;
  private _renderItem = (hover: boolean) => {
    const { file, personName, modifiedTime, downloadUrl, id } = this.props;
    const fileInfo = file || {};
    const { name } = fileInfo;
    return (
      <>
        <JuiListItemIcon>
          <Thumbnail id={id} type="file" />
        </JuiListItemIcon>
        <JuiListItemText
          primary={
            <FileName>
              {postParser(name, {
                fileName: true,
                keyword: this.context.keyword,
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
