/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-15 10:53:15
 * Copyright © RingCentral. All rights reserved.
 */

import FileItemModel from '@/store/models/FileItem';

type FilesProps = {
  id: number;
};

type ImageItemProps = {
  file: FileItemModel;
  secondary: string;
  url: string;
  action?: () => void;
};

export { ImageItemProps, FilesProps };
