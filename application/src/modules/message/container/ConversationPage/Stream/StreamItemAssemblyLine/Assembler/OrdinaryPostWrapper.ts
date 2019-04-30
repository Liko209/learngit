/*
 * @Author: Andy Hu
 * @Date: 2019-01-08 10:55:36
 * Copyright © RingCentral. All rights reserved.
 */
import { Assembler } from './Assembler';

import _ from 'lodash';
import { StreamItemType, StreamItem } from '../../types';
import { AssemblerDelFunc, AssemblerAddFunc } from './types';
import { ISortableModel } from '@/store/base';

export class OrdinaryPostWrapper extends Assembler {
  onAdd: AssemblerAddFunc = ({ added, postList, streamItemList, ...rest }) => {
    const convert2StreamItem: (i: ISortableModel) => StreamItem = i => ({
      id: i.sortValue,
      type: StreamItemType.POST,
      value: [i.id],
      timeStart: i.sortValue,
    });

    const addedItems: StreamItem[] = _(added)
      .map(convert2StreamItem)
      .value();
    const items = streamItemList.unionBy(addedItems, 'id');
    return {
      postList,
      added: [],
      streamItemList: items,
      ...rest,
    };
  }
  onDelete: AssemblerDelFunc = ({ deleted, streamItemList, ...rest }) => {
    let item = streamItemList;
    deleted.forEach((id: number) => {
      item = item.filter(
        item =>
          item.type !== StreamItemType.POST ||
          !(item.value as number[]).includes(id),
      );
    });
    return { streamItemList: item, deleted: [], ...rest };
  }
}
