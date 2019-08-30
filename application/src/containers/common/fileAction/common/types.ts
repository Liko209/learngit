import FileItemModel from '@/store/models/FileItem';

/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-30 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */

export interface IFileActionBaseViewModel {
  fileId: number;
  item: FileItemModel;
  fileName: string;
}

export type FileActionProps = {
  fileId: number;
  postId?: number;
};
