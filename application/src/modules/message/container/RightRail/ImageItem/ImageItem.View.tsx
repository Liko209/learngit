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
import { Thumbnail } from '../../Thumbnail';
import { showImageViewer } from '@/containers/Viewer';
import { FileName } from 'jui/pattern/ConversationCard/Files/FileName';
import { ImageItemViewProps, ImageItemProps } from './types';
import { Download } from '@/containers/common/Download';
import { SecondaryText } from '../common/SecondaryText.View';
const SQUARE_SIZE = 36;
import { JuiButtonBar } from 'jui/components/Buttons';
import { FileActionMenu } from '@/containers/common/fileAction';

@observer
class ImageItemView extends Component<ImageItemViewProps & ImageItemProps> {
  private _thumbnailRef: React.RefObject<any> = React.createRef();
  private _renderItem = (hover: boolean) => {
    const { fileName, id, personName, modifiedTime, downloadUrl } = this.props;
    return (
      <>
        <JuiListItemIcon>
          <Thumbnail
            ref={this._thumbnailRef}
            id={id}
            type="image"
            onClick={this._handleImageClick}
          />
        </JuiListItemIcon>
        <JuiListItemText
          primary={<FileName filename={fileName} />}
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

  _handleImageClick = async (event: React.MouseEvent<HTMLElement>) => {
    const { id, groupId } = this.props;
    const target = event.currentTarget;
    showImageViewer(groupId, id, {
      thumbnailSrc: this._thumbnailRef.current.vm.thumbsUrlWithSize,
      initialWidth: SQUARE_SIZE,
      initialHeight: SQUARE_SIZE,
      originElement: target,
    });
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
