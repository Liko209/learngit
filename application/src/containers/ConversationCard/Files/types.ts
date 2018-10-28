/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-24 16:01:50
 * Copyright © RingCentral. All rights reserved.
 */
// import { RouteComponentProps } from 'react-router-dom';
// import { TranslationFunction, i18n } from 'i18next';
import ItemModel from '@/store/models/Item';

enum FileType {
  image,
  document,
  others,
}

type FilesProps = {
  ids: number[];
};

type FilesViewProps = {
  items: ItemModel[];
  needPreview: () => boolean;
  getFileType: (
    item: ItemModel,
  ) => {
    id: number;
    type: number;
    url: string;
    item: ItemModel;
  };
  getPreviewFileInfo: (item: ItemModel) => string;
  getFileIcon: (fileType: string) => string | null;
  ids: number[];
};

export { FilesProps, FilesViewProps, FileType };
