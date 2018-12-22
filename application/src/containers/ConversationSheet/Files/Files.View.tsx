/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-24 15:44:40
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { t } from 'i18next';
import {
  JuiFileWithoutPreview,
  JuiFileWithPreview,
  JuiPreviewImage,
} from 'jui/pattern/ConversationCard/Files';
import { JuiIconButton } from 'jui/components/Buttons';
import { AttachmentItem } from 'jui/pattern/MessageInput/AttachmentItem';
import { getFileSize } from './helper';
import { getFileIcon } from '../helper';
import { FilesViewProps, FileType, ExtendFileItem } from './types';

const downloadBtn = (downloadUrl: string) => (
  <JuiIconButton
    component="a"
    download={true}
    href={downloadUrl}
    variant="plain"
    tooltipTitle={t('download')}
  >
    get_app
  </JuiIconButton>
);

class FilesView extends React.Component<FilesViewProps> {
  componentWillUnmount() {
    this.props.dispose();
  }
  render() {
    const { files, progresses } = this.props;
    return (
      <>
        {files[FileType.image].map((file: ExtendFileItem) => {
          const { item, previewUrl } = file;
          const { origHeight, id, origWidth, name, downloadUrl } = item;
          if (id < 0) {
            return (
              <AttachmentItem
                hideRemoveButton={true}
                key={id}
                name={name}
                progress={progresses.get(id)}
                onClickDeleteButton={() => this.props.removeFile(id)}
              />
            );
          }
          return (
            <JuiPreviewImage
              key={id}
              ratio={origHeight / origWidth}
              fileName={name}
              url={previewUrl}
              Actions={downloadBtn(downloadUrl)}
            />
          );
        })}
        {files[FileType.document].map((file: ExtendFileItem) => {
          const { item, previewUrl } = file;
          const { size, type, id, name, downloadUrl } = item;
          const iconType = getFileIcon(type);
          if (id < 0) {
            return (
              <AttachmentItem
                hideRemoveButton={true}
                key={id}
                name={name}
                icon={iconType || undefined}
                progress={progresses.get(id)}
                onClickDeleteButton={() => this.props.removeFile(id)}
              />
            );
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
            return (
              <AttachmentItem
                hideRemoveButton={true}
                key={id}
                name={name}
                icon={iconType || undefined}
                progress={progresses.get(id)}
                onClickDeleteButton={() => this.props.removeFile(id)}
              />
            );
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
