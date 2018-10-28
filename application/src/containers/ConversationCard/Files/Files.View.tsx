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

import { FilesViewProps, FileType } from './types';
import ItemModel from '@/store/models/Item';

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

const components = {
  [FileType.image]: (props: any) => {
    const { item, name, previewUrl, downloadUrl } = props;
    const { origHeight, origWidth } = item;
    return (
      <JuiPreviewImage
        ratio={origHeight / origWidth}
        fileName={name}
        url={previewUrl}
        actions={downLoadBtn(downloadUrl)}
      />
    );
  },
  [FileType.document]: (props: any) => (
    <JuiFileWithPreview
      fileName={props.name}
      size={`${getSize(props.size)}`}
      url={props.previewUrl}
      iconType={props.iconType}
      actions={downLoadBtn(props.downloadUrl)}
    />
  ),
  [FileType.others]: (props: any) => (
    <JuiFileWithoutPreview
      fileName={props.name}
      size={`${getSize(props.size)}`}
      iconType={props.iconType}
      actions={downLoadBtn(props.downloadUrl)}
    />
  ),
};

class FilesView extends React.Component<FilesViewProps> {
  render() {
    const { items, getFileType, getFileIcon } = this.props;
    const files = items.map((item: ItemModel) => {
      return getFileType(item);
    });
    console.log(files, '------file');
    return (
      <>
        {files.map((file: any) => {
          const Component = components[file.type];
          const item: ItemModel = file.item;
          const { name, size, downloadUrl } = item;
          const iconType = getFileIcon(item.type);
          return (
            <Component
              name={name}
              iconType={iconType}
              downloadUrl={downloadUrl}
              size={size}
              key={file.id}
              {...file}
            />
          );
        })}
      </>
    );
  }
}

/**
 * needPreview(item) ? (
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
 */
export { FilesView };
