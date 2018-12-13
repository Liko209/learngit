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
import { AttachmentItemAction } from 'jui/pattern/MessageInput/AttachmentItem';
import { getFileSize } from './helper';
import { getFileIcon } from '../helper';
import { FilesViewProps, FileType, ExtendFileItem } from './types';

const downloadBtn = (downloadUrl: string, progress?: number) => {
  const download = () => window.open(downloadUrl);
  const loading = typeof progress === 'number' && progress < 1 && progress > 0;
  const iconButton = (
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
  return (
    <AttachmentItemAction
      icon={iconButton}
      onClick={download}
      value={progress}
      loading={loading}
    />
  );
};

class FilesView extends React.Component<FilesViewProps> {
  render() {
    const { files, progresses } = this.props;

    return (
      <>
        {files[FileType.image].map((file: ExtendFileItem) => {
          const { item, previewUrl } = file;
          const { origHeight, id, origWidth, name, downloadUrl } = item;
          return (
            <JuiPreviewImage
              key={id}
              ratio={origHeight / origWidth}
              fileName={name}
              url={previewUrl}
              Actions={downloadBtn(downloadUrl, progresses.get(id))}
            />
          );
        })}
        {files[FileType.document].map((file: ExtendFileItem) => {
          const { item, previewUrl } = file;
          const { size, type, id, name, downloadUrl } = item;
          const iconType = getFileIcon(type);
          return (
            <JuiFileWithPreview
              key={id}
              fileName={name}
              size={`${getFileSize(size)}`}
              url={previewUrl}
              iconType={iconType}
              Actions={downloadBtn(downloadUrl, progresses.get(id))}
            />
          );
        })}
        {files[FileType.others].map((file: ExtendFileItem) => {
          const { item } = file;
          const { size, type, name, downloadUrl, id } = item;
          const iconType = getFileIcon(type);
          return (
            <JuiFileWithoutPreview
              key={id}
              fileName={name}
              size={`${getFileSize(size)}`}
              iconType={iconType}
              Actions={downloadBtn(downloadUrl, progresses.get(id))}
            />
          );
        })}
      </>
    );
  }
}

export { FilesView };
