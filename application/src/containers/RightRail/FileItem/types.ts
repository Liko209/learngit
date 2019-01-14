/*
 * @Author: isaac.liu
 * @Date: 2019-01-08 14:28:15
 * Copyright © RingCentral. All rights reserved.
 */
import FileItemModel from '@/store/models/FileItem';

type FilesProps = {
  id: number;
};

type FileItemProps = {
  file: FileItemModel;
  subTitle: string;
  fileTypeOrUrl: {
    icon: string;
    url: string;
  };
  disabled?: boolean;
  action?: () => void;
};

export { FileItemProps, FilesProps };
