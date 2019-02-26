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
import { Post } from 'sdk/module/post/entity';
import { Assembler } from './Assembler';
import { StreamItemType, StreamItem } from '../../types';
import { getDateTimeStamp } from '@/utils/date';

export class DateSeparator extends Assembler {
  onAdd: AssemblerAddFunc = ({ added, postList, streamItemList, ...rest }) => {
    const criteria = (post: Post) => getDateTimeStamp(post.created_at);
    const postByDay = _(added).groupBy(raw_post => criteria(raw_post.data));
    const convertDateToStreamItem: (t: number) => StreamItem = (
      timeStamp: number,
    ) => ({
      id: Number(timeStamp),
      timeStart: Number(timeStamp),
      type: StreamItemType.DATE_SEPARATOR,
    });
    const dates = postByDay
      .keys()
      .map(convertDateToStreamItem)
      .value();
    const streamItems = streamItemList.concat(dates);

    return { postList, added, streamItemList: streamItems, ...rest };
  }

  onDelete: AssemblerDelFunc = (args: AssemblerDelFuncArgs) => {
    return { ...args };
  }
}
