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
import { getSize } from '@/utils/helper';

import { FilesViewProps, FileType, extendFile } from './types';

const downLoadBtn = (downloadUrl: string) => (
  <JuiIconButton
    component="a"
    download={true}
    href={downloadUrl}
    variant="plain"
    tooltipTitle="download"
  >
    vertical_align_bottom
  </JuiIconButton>
);

class FilesView extends React.Component<FilesViewProps> {
  render() {
    const { getFileIcon, files } = this.props;

    return (
      <>
        {files[FileType.image].map((file: extendFile) => {
          const { item, id, previewUrl } = file;
          const { origHeight, origWidth, name, downloadUrl } = item;
          return (
            <JuiPreviewImage
              key={id}
              ratio={origHeight / origWidth}
              fileName={name}
              url={previewUrl}
              actions={downLoadBtn(downloadUrl)}
            />
          );
        })}
        {files[FileType.document].map((file: extendFile) => {
          const { item, id, previewUrl } = file;
          const { size, type, name, downloadUrl } = item;
          const iconType = getFileIcon(type);
          return (
            <JuiFileWithPreview
              key={id}
              fileName={name}
              size={`${getSize(size)}`}
              url={previewUrl}
              iconType={iconType}
              actions={downLoadBtn(downloadUrl)}
            />
          );
        })}
        {files[FileType.others].map((file: extendFile) => {
          const { item, id } = file;
          const { size, type, name, downloadUrl } = item;
          const iconType = getFileIcon(type);
          return (
            <JuiFileWithoutPreview
              key={id}
              fileName={name}
              size={`${getSize(size)}`}
              iconType={iconType}
              actions={downLoadBtn(downloadUrl)}
            />
          );
        })}
      </>
    );
  }
}

export { FilesView };
