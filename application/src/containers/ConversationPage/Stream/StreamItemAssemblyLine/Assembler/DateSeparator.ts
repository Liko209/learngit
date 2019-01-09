/*
 * @Author: Andy Hu
 * @Date: 2019-01-08 10:55:23
 * Copyright © RingCentral. All rights reserved.
 */
import {
  AssemblerAddFunc,
  AssemblerDelFunc,
  AssemblerDelFuncArgs,
} from './types';
import _ from 'lodash';
import moment from 'moment';
import { Post } from 'sdk/module/post/entity';
import { Assembler } from './Assembler';
import { StreamItemType } from '../../types';
export class DateSeparator extends Assembler {
  onAdd: AssemblerAddFunc = ({ added, postList, newItems, ...rest }) => {
    const criteria = (post: Post) =>
      moment(post.created_at)
        .startOf('day')
        .valueOf();
    const postByDay = _(added)
      .groupBy(raw_post => criteria(raw_post.data))
      .value();
    const days = Object.keys(postByDay);
    const streamItems = _(days)
      .map(timeStamp => ({
        id: Number(timeStamp),
        timeStart: Number(timeStamp),
        type: StreamItemType.DATE_SEPARATOR,
        value: Number(timeStamp),
      }))
      .value();
    const items = _(newItems)
      .unionBy(streamItems, 'id')
      .value();
    return { postList, added, newItems: items, ...rest };
  }

  onDelete: AssemblerDelFunc = (args: AssemblerDelFuncArgs) => {
    return { ...args };
  }
}
