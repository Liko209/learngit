/*
 * @Author: Andy Hu
 * @Date: 2019-01-08 10:55:36
 * Copyright © RingCentral. All rights reserved.
 */
import { Assembler } from './Assembler';

import _ from 'lodash';
import { StreamItemType, StreamItem } from '../../types';
import { AssemblerDelFunc, AssemblerAddFunc } from './types';
export class OrdinaryPostWrapper extends Assembler {
  onAdd: AssemblerAddFunc = ({ added, postList, newItems }) => {
    const wrapped: StreamItem[] = _(added)
      .map(i => ({
        id: i.data.created_at,
        type: StreamItemType.POST,
        value: [i.data.id],
        timeStart: i.data.created_at,
      }))
      .value();
    const items = _(wrapped)
      .unionBy(newItems, 'id')
      .value();
    return {
      postList,
      added: [],
      newItems: items,
    };
  }
  onDelete: AssemblerDelFunc = (args: any) => {
    return args;
  }
}
