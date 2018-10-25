/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-24 16:01:50
 * Copyright © RingCentral. All rights reserved.
 */
// import { RouteComponentProps } from 'react-router-dom';
// import { TranslationFunction, i18n } from 'i18next';

type FileItemsProps = {
  ids: number[];
};

type FileItemsViewProps = {
  getFileItems: Function;
  ids: number[];
};

export { FileItemsProps, FileItemsViewProps };
