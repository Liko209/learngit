/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-24 16:01:50
 * Copyright © RingCentral. All rights reserved.
 */
import { FileType, ExtendFileItem } from '@/store/models/FileItem';
import { PromisedComputedValue } from 'computed-async-mobx';
import { Post } from 'sdk/module/post/entity';

type FilesProps = {
  ids: number[];
  postId: number;
};

type FilesViewProps = {
  postId: number;
  groupId: number;
  mode?: string;
  post: Post;
  files: {
    [FileType.image]: ExtendFileItem[];
    [FileType.document]: ExtendFileItem[];
    [FileType.others]: ExtendFileItem[];
  };
  progresses: Map<number, number>;
  ids: number[];
  getCurrentVersionIndex: (itemId: number) => number;
  removeFile: (id: number) => void;
  dispose: () => void;
  urlMap: Map<number, string>;
  getShowDialogPermission: () => boolean;
  getFilePreviewBackgroundContainPermission: PromisedComputedValue<boolean>;
  getCropImage: () => Promise<void>;
  isRecentlyUploaded: (id: number) => boolean;
};

export { FilesProps, FilesViewProps, FileType, ExtendFileItem };
