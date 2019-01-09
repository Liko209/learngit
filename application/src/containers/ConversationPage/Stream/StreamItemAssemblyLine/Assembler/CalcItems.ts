/*
 * @Author: Andy Hu
 * @Date: 2019-01-08 10:55:23
 * Copyright © RingCentral. All rights reserved.
 */
import { AssemblerAddFunc, AssemblerDelFunc } from './types';
import _ from 'lodash';
import { Assembler } from './Assembler';
import { StreamItem, StreamItemType } from '../../types';

export class SingletonTagChecker extends Assembler {
  onAdd: AssemblerAddFunc = ({
    added,
    postList,
    newItems,
    streamItemList,
    ...rest
  }) => {
    const filteredItems: StreamItem[] = [];
    const items = _([...streamItemList, ...newItems])
      .sortBy('id')
      .reverse()
      .reduce((prev, curr) => {
        const last = _.last(prev);
        if (!last) {
          return prev.concat(curr);
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
      },      filteredItems);
    return { streamItemList, postList, added, newItems: items, ...rest };
  }

  onDelete: AssemblerDelFunc = (args: any) => {
    return args;
  }
}
