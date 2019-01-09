/*
 * @Author: Andy Hu
 * @Date: 2019-01-08 10:55:39
 * Copyright © RingCentral. All rights reserved.
 */
import { ISortableModel } from '@/store/base/fetch/types';
import { Post } from 'sdk/module/post/entity';
import { StreamItem } from '../../types';
export type AssemblerAddFuncArgs = {
  added: (ISortableModel<Post> & { data: Post })[];
  postList: ISortableModel<Post>[];
  newItems: StreamItem[];
  hasMore: boolean;
  streamItemList: StreamItem[];
};
export type AssemblerDelFuncArgs = {
  deleted: number[];
  postList: ISortableModel<Post>[];
  deletedIds: number[];
  streamItemList: StreamItem[];
};
export type AssemblerAddFunc = (
  args: AssemblerAddFuncArgs,
) => AssemblerAddFuncArgs;
export type AssemblerDelFunc = (
  args: AssemblerDelFuncArgs,
) => AssemblerDelFuncArgs;
