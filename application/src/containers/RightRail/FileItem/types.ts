/*
 * @Author: isaac.liu
 * @Date: 2019-01-08 14:28:15
 * Copyright © RingCentral. All rights reserved.
 */
import { FileProps, FileViewProps } from '../File.types';

type FileItemProps = FileProps;

type FileItemViewProps = {
  fileTypeOrUrl: {
    icon: string;
    url: string;
  };
} & FileViewProps;

export { FileItemProps, FileItemViewProps };
