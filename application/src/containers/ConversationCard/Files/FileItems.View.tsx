/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-24 15:44:40
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import {
  JuiFileWithoutPreview,
  JuiFileWithPreview,
} from 'jui/pattern/ConversationCard/Files';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';

import { FileItemsViewProps } from './types';

const getSize = (bytes: number) => {
  if (bytes / 1000 < 1000) {
    return `${(bytes / 1000).toFixed(1)}Kb`;
  }
  return `${(bytes / 1000 / 1000).toFixed(1)}Mb`;
};

class FileItemsView extends React.Component<FileItemsViewProps> {
  render() {
    const { item, needPreview, getPreviewFileInfo, getFileIcon } = this.props;
    const { name, size, downloadUrl } = item;
    console.log(item, needPreview(item), '------file');
    const previewUrl = getPreviewFileInfo(item);
    const iconType = getFileIcon(item.type);
    console.log(iconType, '-----file icon');
    return needPreview(item) ? (
      <JuiFileWithPreview
        fileName={name}
        size={`${getSize(size)}`}
        url={previewUrl}
        iconType={iconType}
        actions={
          <JuiIconButton
            component="a"
            download={true}
            href={downloadUrl}
            variant="plain"
            tooltipTitle="download"
          >
            vertical_align_bottom
          </JuiIconButton>
        }
      />
    ) : (
      <JuiFileWithoutPreview
        fileName={name}
        size={`${getSize(size)}`}
        iconType={iconType}
        actions={
          <JuiIconButton
            component="a"
            download={true}
            href={downloadUrl}
            variant="plain"
            tooltipTitle="download"
          >
            vertical_align_bottom
          </JuiIconButton>
        }
      />
    );
  }
}

export { FileItemsView };
