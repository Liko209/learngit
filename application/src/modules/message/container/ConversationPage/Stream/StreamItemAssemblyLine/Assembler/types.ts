/*
 * @Author: Andy Hu
 * @Date: 2019-01-08 10:55:39
 * Copyright © RingCentral. All rights reserved.
 */
import { ISortableModel } from '@/store/base/fetch/types';
import { StreamItem } from '../../types';
export type AssemblerAddFuncArgs = {
  added: ISortableModel[];
  postList: ISortableModel[];
  hasMore: boolean;
  streamItemList: _.LoDashImplicitWrapper<StreamItem[]>;
  readThrough: number;
};
export type AssemblerDelFuncArgs = {
  deleted: number[];
  postList: ISortableModel[];
  streamItemList: _.LoDashImplicitWrapper<StreamItem[]>;
  readThrough: number;
};
export type AssemblerAddFunc = (
  args: AssemblerAddFuncArgs,
) => AssemblerAddFuncArgs;
export type AssemblerDelFunc = (
  args: AssemblerDelFuncArgs,
) => AssemblerDelFuncArgs;
