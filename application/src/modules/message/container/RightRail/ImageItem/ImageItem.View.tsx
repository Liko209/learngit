/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-15 11:07:53
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, computed } from 'mobx';
import {
  JuiListItem,
  JuiListItemText,
  JuiListItemIcon,
  JuiListItemSecondaryAction,
} from 'jui/components/Lists';
import { Thumbnail } from '../../Thumbnail';
import { FileName } from 'jui/pattern/ConversationCard/Files/FileName';
import { ImageItemViewProps, ImageItemProps } from './types';
import { Download } from '@/containers/common/Download';
import { SecondaryText } from '../common/SecondaryText.View';
import { postParser } from '@/common/postParser';
import { JuiButtonBar } from 'jui/components/Buttons';
import { FileActionMenu } from '@/containers/common/fileAction';
import { container } from 'framework/ioc';
import { IViewerService, VIEWER_SERVICE } from '@/modules/viewer/interface';
import { HoverHelper } from '../common/HoverHelper';

const SQUARE_SIZE = 36;

@observer
class ImageItemView extends Component<ImageItemViewProps & ImageItemProps> {
  private _viewerService: IViewerService = container.get(VIEWER_SERVICE);
  private _hoverHelper = new HoverHelper();
  @observable private _thumbnailRef: React.RefObject<any> = React.createRef();

  private _openImageViewer = (event: React.MouseEvent<HTMLElement>) => {
    const { id, groupId } = this.props;
    const target = event.currentTarget;
    this._viewerService.showImageViewer(groupId, id, {
      thumbnailSrc: this._thumbnailRef.current.vm.thumbsUrlWithSize,
      initialWidth: SQUARE_SIZE,
      initialHeight: SQUARE_SIZE,
      originElement: target,
    });
  };

  @computed
  private get _handleImageClick() {
    return this._thumbnailRef.current &&
      this._thumbnailRef.current.vm.thumbsUrlWithSize
      ? this._openImageViewer
      : undefined;
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
      <JuiListItemIcon>
        <Thumbnail ref={this._thumbnailRef} id={this.props.id} type="image" />
      </JuiListItemIcon>
    );
  }

  @computed
  private get _itemText() {
    return (
      <JuiListItemText primary={this._primary} secondary={this._secondary} />
    );
  }

  render() {
    const { file } = this.props;
    if (file.isMocked || file.id < 0) {
      return <></>;
    }
    const { downloadUrl, id, groupId } = this.props;
    return (
      <JuiListItem
        data-test-automation-id="rightRail-image-item"
        onClick={this._handleImageClick}
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

export { ImageItemView };
