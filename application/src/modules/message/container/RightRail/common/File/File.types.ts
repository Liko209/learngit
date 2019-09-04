/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-21 16:47:14
 * Copyright © RingCentral. All rights reserved.
 */

import FileItemModel from '@/store/models/FileItem';

type FileProps = {
  id: number;
  groupId: number;
};

type FileViewModelProps = {
  file: FileItemModel;
  fileName: string;
  personName: string;
  modifiedTime: string;
  downloadUrl: string;
};

type FileViewProps = FileProps & FileViewModelProps;

export { FileProps, FileViewProps, FileViewModelProps };
