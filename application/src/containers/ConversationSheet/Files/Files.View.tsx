/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-24 15:44:40
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { t } from 'i18next';
import {
  JuiFileWithoutPreview,
  JuiFileWithPreview,
  JuiPreviewImage,
} from 'jui/pattern/ConversationCard/Files';
import { JuiIconButton } from 'jui/components/Buttons';
import { getThumbnailSize } from 'jui/foundation/utils';
import {
  AttachmentItem,
  ITEM_STATUS,
} from 'jui/pattern/MessageInput/AttachmentItem';
import { getFileSize } from './helper';
import { FilesViewProps, FileType, ExtendFileItem } from './types';
import { getFileIcon } from '@/common/getFileIcon';

const SQUARE_SIZE = 180;

const downloadBtn = (downloadUrl: string) => (
  <JuiIconButton
    component="a"
    download={true}
    href={downloadUrl}
    variant="plain"
    tooltipTitle={t('download')}
  >
    download
  </JuiIconButton>
);

@observer
class FilesView extends React.Component<FilesViewProps> {
  componentWillUnmount() {
    this.props.dispose();
  }
  private _renderItem = (
    id: number,
    progresses: Map<number, number>,
    name: string,
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
      <AttachmentItem
        fileIcon={getFileIcon(name)}
        status={realStatus}
        key={id}
        name={name}
        progress={progress}
        onClickDeleteButton={() => this.props.removeFile(id)}
      />
    );
  }

  async componentDidMount() {
    await this.props.getCropImage();
  }

  render() {
    const { files, progresses, urlMap } = this.props;
    const singleImage = files[FileType.image].length === 1;
    return (
      <>
        {files[FileType.image].map((file: ExtendFileItem) => {
          const { item } = file;
          const { origHeight, id, origWidth, name, downloadUrl } = item;
          if (id < 0) {
            return this._renderItem(id, progresses, name);
          }
          let size = { width: SQUARE_SIZE, height: SQUARE_SIZE };
          if (singleImage) {
            size = getThumbnailSize(origWidth, origHeight);
          }
          return (
            <JuiPreviewImage
              key={id}
              width={size.width || SQUARE_SIZE}
              height={size.height || SQUARE_SIZE}
              forceSize={!singleImage}
              squareSize={SQUARE_SIZE}
              fileName={name}
              url={urlMap.get(id) || ''}
              Actions={downloadBtn(downloadUrl)}
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
              Actions={downloadBtn(downloadUrl)}
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
              Actions={downloadBtn(downloadUrl)}
            />
          );
        })}
      </>
    );
  }
}

export { FilesView };
