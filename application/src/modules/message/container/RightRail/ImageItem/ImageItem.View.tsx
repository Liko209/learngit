/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-15 11:07:53
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import {
  JuiListItemText,
  JuiListItemWithHover,
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

const SQUARE_SIZE = 36;

@observer
class ImageItemView extends Component<ImageItemViewProps & ImageItemProps> {
  _viewerService: IViewerService = container.get(VIEWER_SERVICE);
  @observable private _thumbnailRef: React.RefObject<any> = React.createRef();
  private _renderItem = (hover: boolean) => {
    const {
      fileName,
      id,
      personName,
      modifiedTime,
      downloadUrl,
      groupId,
    } = this.props;
    return (
      <>
        <JuiListItemIcon>
          <Thumbnail ref={this._thumbnailRef} id={id} type="image" />
        </JuiListItemIcon>
        <JuiListItemText
          primary={
            <FileName>
              {postParser(fileName, {
                fileName: true,
              })}
            </FileName>
          }
          secondary={<SecondaryText name={personName} time={modifiedTime} />}
        />
        {hover && (
          <JuiListItemSecondaryAction>
            <JuiButtonBar isStopPropagation overlapSize={-2}>
              <Download url={downloadUrl} />
              <FileActionMenu fileId={id} disablePortal groupId={groupId} />
            </JuiButtonBar>
          </JuiListItemSecondaryAction>
        )}
      </>
    );
  };

  _handleImageClick = async (event: React.MouseEvent<HTMLElement>) => {
    if (!this._thumbnailRef.current.vm.thumbsUrlWithSize) return;
    const { id, groupId } = this.props;
    const target = event.currentTarget;
    this._viewerService.showImageViewer(groupId, id, {
      thumbnailSrc: this._thumbnailRef.current.vm.thumbsUrlWithSize,
      initialWidth: SQUARE_SIZE,
      initialHeight: SQUARE_SIZE,
      originElement: target,
    });
  };

  render() {
    const { file } = this.props;
    if (file.isMocked || file.id < 0) {
      return <></>;
    }
    return (
      <JuiListItemWithHover
        onClick={
          this._thumbnailRef.current &&
          this._thumbnailRef.current.vm.thumbsUrlWithSize
            ? this._handleImageClick
            : undefined
        }
        render={this._renderItem}
        data-test-automation-id="rightRail-image-item"
      />
    );
  }
}

export { ImageItemView };
