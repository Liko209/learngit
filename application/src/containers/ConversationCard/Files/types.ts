/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-24 16:01:50
 * Copyright © RingCentral. All rights reserved.
 */
// import { RouteComponentProps } from 'react-router-dom';
// import { TranslationFunction, i18n } from 'i18next';
import ItemModel from '@/store/models/Item';

type FilesProps = {
  id: number;
};

type FilesViewProps = {
  item: ItemModel;
  needPreview: (item: ItemModel) => boolean;
  getPreviewFileInfo: (item: ItemModel) => string;
  getFileIcon: (fileType: string) => string | null;
  id: number;
};

export { FilesProps, FilesViewProps };
