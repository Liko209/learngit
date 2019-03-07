/*
 * @Author: Andy Hu
 * @Date: 2019-01-08 10:55:23
 * Copyright © RingCentral. All rights reserved.
 */
import {
  AssemblerAddFunc,
  AssemblerDelFunc,
  AssemblerDelFuncArgs,
  AssemblerAddFuncArgs,
} from './types';

import _ from 'lodash';
import { Assembler } from './Assembler';
import { StreamItem, StreamItemType } from '../../types';

export class SingletonTagChecker extends Assembler {
  onAdd: AssemblerAddFunc = (args: AssemblerAddFuncArgs) => {
    const { streamItemList } = args;
    const items = streamItemList
      .sortBy('id')
      .sortedUniqBy('id')
      .reduceRight(this.filterDuplicateTags, []);
    return { ...args, streamItemList: _(items) };
  }

  onDelete: AssemblerDelFunc = (args: AssemblerDelFuncArgs) => {
    const { streamItemList } = args;
    const items = streamItemList
      .sortBy('id')
      .sortedUniqBy('id')
      .reduceRight(this.filterDuplicateTags, []);
    return {
      ...args,
      deleted: [],
      streamItemList: _(items),
    };
  }

  filterDuplicateTags = (prev: StreamItem[], curr: StreamItem) => {
    if (curr.type === StreamItemType.POST) {
      return prev.concat(curr);
    }
    const last = _.last(prev);
    if (!last) {
      return prev;
    }
    const lastType = last.type;
    const currType = curr.type;
    const types = [
      StreamItemType.DATE_SEPARATOR,
      StreamItemType.NEW_MSG_SEPARATOR,
    ];
    if (types.includes(lastType) && types.includes(currType)) {
      if (currType === StreamItemType.NEW_MSG_SEPARATOR) {
        prev.pop(); // pop the old tag
        return prev.concat(curr);
      }
      return prev;
    }
    return prev.concat(curr);
  }
}
