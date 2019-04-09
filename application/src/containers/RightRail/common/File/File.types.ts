/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-21 16:47:14
 * Copyright © RingCentral. All rights reserved.
 */

import FileItemModel from '@/store/models/FileItem';

type FileViewModelProps = {
  id: number;
};

type FileProps = FileViewModelProps & {
  groupId: number;
};

type FileViewProps = FileViewModelProps & {
  file: FileItemModel;
  fileName: string;
  personName: string;
  createdTime: string;
  downloadUrl: string;
};

export { FileProps, FileViewProps, FileViewModelProps };
