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
import { mainLogger } from 'sdk/src';

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
    const { deleted, streamItemList, deletedIds, postList } = args;

    deleted.forEach((id: number) => {
      const streamItem = streamItemList.find(
        item => item.type === StreamItemType.POST && item.value.includes(id),
      );
      if (!streamItem) {
        mainLogger.error('This should not be happened');
        return args;
      }
      const dateSeparatorId = moment(streamItem.id)
        .startOf('day')
        .valueOf();
      const nextPost = postList.find(i => i.id > id);
      if (!nextPost) {
        return deletedIds.push(dateSeparatorId);
      }
      const nextPostCreatedTime = moment(nextPost.data!.created_at)
        .startOf('day')
        .valueOf();
      if (nextPostCreatedTime !== dateSeparatorId) {
        return deletedIds.push(dateSeparatorId);
      }
      return;
    });
    return { ...args, deletedIds };
  }
}
