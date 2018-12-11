/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-24 16:01:50
 * Copyright © RingCentral. All rights reserved.
 */
// import { RouteComponentProps } from 'react-router-dom';
// import { TranslationFunction, i18n } from 'i18next';
import { FileType, ExtendFileItem } from '@/store/models/FileItem';

type FilesProps = {
  ids: number[];
};

type FilesViewProps = {
  files: {
    [FileType.image]: ExtendFileItem[];
    [FileType.document]: ExtendFileItem[];
    [FileType.others]: ExtendFileItem[];
  };
  ids: number[];
};

export { FilesProps, FilesViewProps, FileType, ExtendFileItem };
