/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-24 16:01:50
 * Copyright © RingCentral. All rights reserved.
 */
import { FileType, ExtendFileItem } from '@/store/models/FileItem';
import { Post } from 'sdk/models';

type FilesProps = {
  ids: number[];
  postId: number;
};

type FilesViewProps = {
  postId: number;
  post: Post;
  files: {
    [FileType.image]: ExtendFileItem[];
    [FileType.document]: ExtendFileItem[];
    [FileType.others]: ExtendFileItem[];
  };
  progresses: Map<number, number>;
  ids: number[];
  removeFile: (id: number) => void;
  dispose: () => void;
};

export { FilesProps, FilesViewProps, FileType, ExtendFileItem };
