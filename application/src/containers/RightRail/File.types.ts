/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-21 16:47:14
 * Copyright © RingCentral. All rights reserved.
 */

import FileItemModel from '@/store/models/FileItem';

type FileProps = {
  id: number;
};

type FileViewProps = {
  id: number;
  file: FileItemModel;
  personName: string;
  createdTime: string;
};

export { FileProps, FileViewProps };
