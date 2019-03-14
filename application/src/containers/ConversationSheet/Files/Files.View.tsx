/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-24 15:44:40
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import {
  JuiFileWithoutPreview,
  JuiFileWithPreview,
  JuiPreviewImage,
  JuiDelayPlaceholder,
} from 'jui/pattern/ConversationCard/Files';
import { getThumbnailSize } from 'jui/foundation/utils';
import {
  AttachmentItem,
  ITEM_STATUS,
} from 'jui/pattern/MessageInput/AttachmentItem';
import { showImageViewer } from '@/containers/Viewer';
import { getFileSize } from './helper';
import { FilesViewProps, FileType, ExtendFileItem } from './types';
import { getFileIcon } from '@/common/getFileIcon';
import { withFuture, FutureCreator } from 'jui/hoc/withFuture';
import { UploadFileTracker } from './UploadFileTracker';
import { Download } from '@/containers/common/Download';

const SQUARE_SIZE = 180;
const FutureAttachmentItem = withFuture(AttachmentItem);

@observer
class FilesView extends React.Component<FilesViewProps> {
  componentWillUnmount() {
    this.props.dispose();
  }
  private _renderItem = (
    id: number,
    progresses: Map<number, number>,
    name: string,
    future?: FutureCreator,
  ) => {
    const progress = progresses.get(id);
    let realStatus: ITEM_STATUS = ITEM_STATUS.NORMAL;
    if (typeof progress !== 'undefined') {
      if (progress < 0) {
        realStatus = ITEM_STATUS.ERROR;
      } else if (progress >= 0 && progress < 100) {
        realStatus = ITEM_STATUS.LOADING;
      } else {
        realStatus = ITEM_STATUS.NORMAL;
      }
    } else if (id < 0) {
      realStatus = ITEM_STATUS.ERROR;
    }
    return (
      <FutureAttachmentItem
        fileIcon={getFileIcon(name)}
        status={realStatus}
        key={id}
        name={name}
        progress={progress}
        onClickDeleteButton={() => this.props.removeFile(id)}
        future={future}
      />
    );
  }

  _handleImageClick = (
    groupId: number,
    id: number,
    thumbnailSrc: string,
    origWidth: number,
    origHeight: number,
  ) => async (ev: React.MouseEvent, loaded?: boolean) => {
    const target = ev.currentTarget as HTMLElement;
    const canShowDialogPermission = await this.props.getShowDialogPermission();
    if (!canShowDialogPermission) {
      return;
    }
    showImageViewer(groupId, id, {
      thumbnailSrc,
      initialWidth: origWidth,
      initialHeight: origHeight,
      originElement: target,
    });
  }

  async componentDidMount() {
    await this.props.getCropImage();
  }

  private _handleImageDidLoad = (id: number, callback: Function) => {
    UploadFileTracker.tracker().clear(this.props.ids);
    callback();
  }

  render() {
    const { files, progresses, urlMap, groupId } = this.props;
    const singleImage = files[FileType.image].length === 1;
    return (
      <>
        {files[FileType.image].map((file: ExtendFileItem) => {
          const { item } = file;
          const { origHeight, id, origWidth, name, downloadUrl } = item;
          let size = { width: SQUARE_SIZE, height: SQUARE_SIZE };
          if (singleImage) {
            size = getThumbnailSize(origWidth, origHeight);
          }
          const placeholder = (
            <JuiDelayPlaceholder width={size.width} height={size.height} />
          );
          if (id < 0 || this.props.isRecentlyUploaded(id)) {
            return this._renderItem(
              id,
              progresses,
              name,
              (callback: Function) => (
                <JuiPreviewImage
                  key={id}
                  didLoad={() => this._handleImageDidLoad(id, callback)}
                  handleImageClick={this._handleImageClick(
                    groupId,
                    id,
                    urlMap.get(id) || '',
                    origWidth,
                    origHeight,
                  )}
                  placeholder={placeholder}
                  width={size.width}
                  height={size.height}
                  forceSize={!singleImage}
                  squareSize={SQUARE_SIZE}
                  fileName={name}
                  url={urlMap.get(id) || ''}
                  Actions={<Download url={downloadUrl} />}
                />
              ),
            );
          }
          return (
            <JuiPreviewImage
              key={id}
              placeholder={React.cloneElement(placeholder, {
                onClick: this._handleImageClick(
                  groupId,
                  id,
                  urlMap.get(id) || '',
                  size.width,
                  size.height,
                ),
              })}
              handleImageClick={this._handleImageClick(
                groupId,
                id,
                urlMap.get(id) || '',
                size.width,
                size.height,
              )}
              width={size.width}
              height={size.height}
              forceSize={!singleImage}
              squareSize={SQUARE_SIZE}
              fileName={name}
              url={urlMap.get(id) || ''}
              Actions={<Download url={downloadUrl} />}
            />
          );
        })}
        {files[FileType.document].map((file: ExtendFileItem) => {
          const { item, previewUrl } = file;
          const { size, type, id, name, downloadUrl } = item;
          const iconType = getFileIcon(type);
          if (id < 0) {
            return this._renderItem(id, progresses, name);
          }
          return (
            <JuiFileWithPreview
              key={id}
              fileName={name}
              size={`${getFileSize(size)}`}
              url={previewUrl}
              iconType={iconType}
              Actions={<Download url={downloadUrl} />}
            />
          );
        })}
        {files[FileType.others].map((file: ExtendFileItem) => {
          const { item } = file;
          const { size, type, name, downloadUrl, id } = item;
          const iconType = getFileIcon(type);
          if (id < 0) {
            return this._renderItem(id, progresses, name);
          }
          return (
            <JuiFileWithoutPreview
              key={id}
              fileName={name}
              size={`${getFileSize(size)}`}
              iconType={iconType}
              Actions={<Download url={downloadUrl} />}
            />
          );
        })}
      </>
    );
  }
}

export { FilesView };
