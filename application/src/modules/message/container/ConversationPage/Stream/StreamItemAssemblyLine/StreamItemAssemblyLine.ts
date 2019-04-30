/*
 * @Author: Andy Hu
 * @Date: 2019-01-08 10:55:47
 * Copyright © RingCentral. All rights reserved.
 */
import { TDeltaWithData, StreamItem } from '../types';
import { Assembler } from './Assembler/Assembler';
import { Post } from 'sdk/module/post/entity';
import { ISortableModel } from '@/store/base';
import _ from 'lodash';
export class StreamItemAssemblyLine {
  constructor(private _assemblers: Assembler[]) {}
  process = (
    delta: TDeltaWithData,
    postList: ISortableModel<Post>[],
    hasMore: boolean,
    streamItemList: StreamItem[],
    readThrough: number,
  ) => {
    const { added, deleted } = delta;
    let _streamItemList = _(streamItemList);

    if (added.length) {
      _streamItemList = this._assemblers.reduce(
        (prev, current) => current.onAdd(prev),
        {
          added,
          postList,
          hasMore,
          readThrough,
          streamItemList: _streamItemList,
        },
      ).streamItemList;
    }

    if (deleted.length) {
      _streamItemList = this._assemblers.reduce(
        (prev, current) => current.onDelete(prev),
        {
          deleted,
          postList,
          readThrough,
          streamItemList: _streamItemList,
        },
      ).streamItemList;
    }

    return { streamItems: _streamItemList.value() };
  }
}
