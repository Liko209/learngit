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
import { Post } from 'sdk/module/post/entity';
import { getDateTimeStamp } from './helper';
export class PostCombiner extends Assembler {
  private _LIMIT: number = 60000;
  onAdd: AssemblerAddFunc = ({
    added,
    postList,
    streamItemList,
    readThrough,
    ...rest
  }) => {
    const unCombinedPosts: (ISortableModel<Post> & { data: Post })[] = [];
    added.forEach((item: ISortableModel<Post> & { data: Post }) => {
      const createTime = item.data.created_at;
      const dateTimestamp = getDateTimeStamp(createTime);
      const lastReadMsg = _(postList).find(['id', readThrough]);
      let timeOfNewMsgFrom: number = -Infinity;
      if (lastReadMsg) {
        timeOfNewMsgFrom = lastReadMsg.data!.created_at + 1;
      }
      const upperLimitTime = Math.max(
        createTime - this._LIMIT,
        dateTimestamp,
        createTime - timeOfNewMsgFrom ? timeOfNewMsgFrom : -Infinity,
      );
      const streamItemToCombineTo = _(streamItemList).find(
        (item: StreamItem) =>
          item.timeStart > upperLimitTime && item.type === StreamItemType.POST,
      );
      if (streamItemToCombineTo) {
        streamItemToCombineTo.value = _(streamItemToCombineTo.value)
          .union([item.id])
          .value();
        streamItemToCombineTo.timeEnd = Math.max(
          streamItemToCombineTo.timeEnd || 0,
          createTime,
        );
        return;
      }
      return unCombinedPosts.push(item);
    });
    return {
      streamItemList,
      postList,
      readThrough,
      added: unCombinedPosts,
      ...rest,
    };
  }
  onDelete: AssemblerDelFunc = ({
    deleted,
    deletedIds,
    streamItemList,
    ...rest
  }) => {
    deleted.forEach((id: number) => {
      const streamItem = streamItemList.find(
        item => item.type === StreamItemType.POST && item.value.includes(id),
      );
      if (streamItem) {
        _(streamItem.value)
          .pull(id)
          .value();
        if (!streamItem.value.length) {
          deletedIds.push(streamItem.id);
        }
      }
    });
    return { streamItemList, deletedIds, deleted: [], ...rest };
  }
}
