/*
 * @Author: Andy Hu
 * @Date: 2019-01-08 10:55:47
 * Copyright © RingCentral. All rights reserved.
 */
import { IStreamItemSortableModel } from '../types';
import { Assembler } from './Assembler/Assembler';
import _ from 'lodash';
import { TDelta } from '@/store/base';

export class StreamItemAssemblyLine {
  constructor(private _assemblers: Assembler[]) {}
  process = (
    delta: TDelta<number, IStreamItemSortableModel>,
    hasMore: boolean,
    readThrough: number,
    sortableModels: IStreamItemSortableModel[],
    postList: IStreamItemSortableModel[],
  ) => {
    const { added, deleted } = delta;
    let _streamItemList = _(sortableModels)
      .map('data')
      .compact();

    if (added.length) {
      _streamItemList = this._assemblers.reduce(
        (prev, current) => current.onAdd(prev),
        {
          added,
          hasMore,
          readThrough,
          postList,
          streamItemList: _streamItemList,
        },
      ).streamItemList;
    }

    if (deleted.length) {
      _streamItemList = this._assemblers.reduce(
        (prev, current) => current.onDelete(prev),
        {
          deleted,
          readThrough,
          postList,
          streamItemList: _streamItemList,
        },
      ).streamItemList;
    }

    return { streamItems: _streamItemList.value() };
  }
}
