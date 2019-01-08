/*
 * @Author: Andy Hu
 * @Date: 2019-01-08 10:55:47
 * Copyright © RingCentral. All rights reserved.
 */
import { TDeltaWithData, StreamItem } from '../types';
import { Assembler } from './Assembler/Assembler';
import { Post } from 'sdk/src/module/post/entity';
import { ISortableModel } from '@/store/base';

export class StreamItemAssemblyLine {
  constructor(private _assemblers: Assembler[]) {}
  process = (
    delta: TDeltaWithData,
    postList: ISortableModel<Post>[],
    hasMore: boolean,
  ) => {
    const { added, deleted } = delta;
    let itemsShouldBeAdded;
    let itemsShouldBeDel;
    if (added.length) {
      const newItems: StreamItem[] = [];
      itemsShouldBeAdded = this._assemblers.reduce(
        (prev, current) => current.onAdd(prev),
        {
          added,
          postList,
          newItems,
          hasMore,
        },
      ).newItems;
    }

    if (deleted.length) {
      const deletedIds: number[] = [];
      itemsShouldBeDel = this._assemblers.reduce(
        (prev, current) => current.onDelete(prev),
        {
          deleted,
          postList,
          deletedIds,
        },
      ).deletedIds;
    }

    return { deletedIds: itemsShouldBeDel, newItems: itemsShouldBeAdded };
  }
}
