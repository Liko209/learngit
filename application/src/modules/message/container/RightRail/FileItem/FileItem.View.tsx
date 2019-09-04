/*
 * @Author: isaac.liu
 * @Date: 2019-01-08 14:24:54
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { container } from 'framework/ioc';
import {
  JuiListItemText,
  JuiListItemSecondaryAction,
  JuiListItem,
} from 'jui/components/Lists';
import { JuiLeftRailListItemIcon } from 'jui/pattern/LeftRail';
import { FileName } from 'jui/pattern/ConversationCard/Files/FileName';
import {
  isFileReadyForViewer,
} from '@/common/getFileType';
import { FileItemViewProps } from './types';
import { Download } from '@/containers/common/Download';
import { SecondaryText } from '../common/SecondaryText.View';
import { JuiButtonBar } from 'jui/components/Buttons';
import { FileActionMenu } from '@/containers/common/fileAction';
import { IViewerService, VIEWER_SERVICE } from '@/modules/viewer/interface';
import { postParser } from '@/common/postParser';
import { JuiThumbnail } from 'jui/components/Thumbnail/Thumbnail';
import { HoverHelper } from '../common/HoverHelper';

@observer
class FileItemView extends Component<FileItemViewProps> {
  private _viewerService: IViewerService = container.get(VIEWER_SERVICE);
  private _hoverHelper = new HoverHelper();

  private _openFileViewer = () => {
    this._viewerService.open({
      groupId: this.props.groupId,
      itemId: this.props.file.id,
    });
  };

  @computed
  private get _handleFileClick() {
    return this._readyForViewer ? this._openFileViewer : undefined;
  }

  @computed
  private get _readyForViewer() {
    return isFileReadyForViewer(this.props.file.status);
  }

  @computed
  private get _primary() {
    return (
      <FileName>
        {postParser(this.props.file.name, {
          fileName: true,
        })}
      </FileName>
    );
  }

  @computed
  private get _secondary() {
    const { personName, modifiedTime } = this.props;
    return <SecondaryText name={personName} time={modifiedTime} />;
  }

  @computed
  private get _icon() {
    return (
      <JuiLeftRailListItemIcon
        disabled={!this._readyForViewer}
      >
        <JuiThumbnail iconType={this.props.file.iconType} />
      </JuiLeftRailListItemIcon>
    );
  }

  @computed
  private get _itemText() {
    return (
      <JuiListItemText primary={this._primary} secondary={this._secondary} />
    );
  }

  render() {
    const { downloadUrl, id, groupId } = this.props;
    return (
      <JuiListItem
        data-test-automation-id="rightRail-file-item"
        onClick={this._handleFileClick}
        {...this._hoverHelper.TriggerProps}
      >
        {this._icon}
        {this._itemText}
        {this._hoverHelper.hovered && (
          <JuiListItemSecondaryAction>
            <JuiButtonBar isStopPropagation overlapSize={-2}>
              <Download url={downloadUrl} />
              <FileActionMenu
                scene="rightShelf"
                fileId={id}
                disablePortal
                groupId={groupId}
              />
            </JuiButtonBar>
          </JuiListItemSecondaryAction>
        )}
      </JuiListItem>
    );
  }
}

export { FileItemView };
