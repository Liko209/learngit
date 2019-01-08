/*
 * @Author: Andy Hu
 * @Date: 2019-01-08 10:55:39
 * Copyright © RingCentral. All rights reserved.
 */
import { ISortableModel } from '@/store/base/fetch/types';
import { Post } from 'sdk/module/post/entity';
import { StreamItem } from '../../types';
export type AssemblerAddFunc = (
  args: {
    added: (ISortableModel<Post> & { data: Post })[];
    postList: ISortableModel<Post>[];
    newItems: StreamItem[];
    hasMore: boolean;
  },
) => {
  added: (ISortableModel<Post> & { data: Post })[];
  postList: ISortableModel<Post>[];
  newItems: StreamItem[];
};
export type AssemblerDelFunc = (
  args: {
    deleted: number[];
    postList: ISortableModel<Post>[];
    deletedIds: number[];
  },
) => {
  deleted: number[];
  postList: ISortableModel<Post>[];
  deletedIds: number[];
};
