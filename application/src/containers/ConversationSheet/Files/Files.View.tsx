/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-24 15:44:40
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import {
  JuiFileWithoutPreview,
  JuiFileWithPreview,
  JuiPreviewImage,
} from 'jui/pattern/ConversationCard/Files';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import { getFileSize } from '@/utils/helper';

import { FilesViewProps, FileType, ExtendFileItem } from './types';

const downloadBtn = (downloadUrl: string) => (
  <JuiIconButton
    component="a"
    download={true}
    href={downloadUrl}
    variant="plain"
    tooltipTitle="download"
  >
    get_app
  </JuiIconButton>
);

class FilesView extends React.Component<FilesViewProps> {
  render() {
    const { files } = this.props;
    console.log(files, '---file file item');

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
              actions={downloadBtn(downloadUrl)}
            />
          );
        })}
        {files[FileType.document].map((file: ExtendFileItem) => {
          const { item, previewUrl } = file;
          const { size, type, id, name, downloadUrl } = item;
          const iconType = item.getFileIcon(type);
          return (
            <JuiFileWithPreview
              key={id}
              fileName={name}
              size={`${getFileSize(size)}`}
              url={previewUrl}
              iconType={iconType}
              actions={downloadBtn(downloadUrl)}
            />
          );
        })}
        {files[FileType.others].map((file: ExtendFileItem) => {
          const { item } = file;
          const { size, type, name, downloadUrl, id } = item;
          const iconType = item.getFileIcon(type);
          return (
            <JuiFileWithoutPreview
              key={id}
              fileName={name}
              size={`${getFileSize(size)}`}
              iconType={iconType}
              actions={downloadBtn(downloadUrl)}
            />
          );
        })}
      </>
    );
  }
}

export { FilesView };
