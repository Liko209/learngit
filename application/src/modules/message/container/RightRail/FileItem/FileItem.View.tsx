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
  isSupportFileViewer,
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

type States = {
  hovered: boolean;
};

@observer
class FileItemView extends Component<FileItemViewProps, States> {
  private _viewerService: IViewerService = container.get(VIEWER_SERVICE);

  constructor(props: FileItemViewProps) {
    super(props);
    this.state = { hovered: false };
  }

  private _handleMouseOver = () => {
    if (!this.state.hovered) {
      this.setState({ hovered: true });
    }
  };

  private _handleMouseOut = (event: React.MouseEvent) => {
    const { target, currentTarget, relatedTarget } = event;
    if (
      !currentTarget.contains(target as Node) ||
      !currentTarget.contains(relatedTarget as Node)
    ) {
      this.setState({ hovered: false });
    }
  };

  private _handleFileClick = () => {
    if(this._supportViewer && this._readyForViewer) {
      this._viewerService.open({
        groupId: this.props.groupId,
        itemId: this.props.file.id
      });
    }
  };

  @computed
  private get _supportViewer() {
    return isSupportFileViewer(this.props.file.type);
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
    const {  personName, modifiedTime } = this.props;
    return (<SecondaryText name={personName} time={modifiedTime} />);
  }

  @computed
  private get _icon() {
    return (
      <JuiLeftRailListItemIcon disabled={this._supportViewer && !this._readyForViewer}>
        <JuiThumbnail iconType={this.props.file.iconType} />
      </JuiLeftRailListItemIcon>
    );
  }

  @computed
  private get _itemText() {
    return (
      <JuiListItemText
        primary={this._primary}
        secondary={this._secondary}
      />
    );
  }

  render() {
    const { downloadUrl, id } = this.props;
    const { hovered } = this.state;
    return (
      <JuiListItem
        onClick={this._handleFileClick}
        onMouseEnter={this._handleMouseOver}
        onMouseOver={this._handleMouseOver}
        onMouseOut={this._handleMouseOut}
        data-test-automation-id="rightRail-file-item"
      >
        {this._icon}
        {this._itemText}
        {hovered && (
          <JuiListItemSecondaryAction>
            <JuiButtonBar isStopPropagation overlapSize={-2}>
              <Download url={downloadUrl} />
              <FileActionMenu fileId={id} disablePortal />
            </JuiButtonBar>
          </JuiListItemSecondaryAction>
        )}
      </JuiListItem>
    );
  }
}

export { FileItemView };
