/*
 * @Author: Conner
 * @Date: 2019-03-06 16:29
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import {
  AssemblerAddFuncArgs,
  AssemblerDelFuncArgs,
} from '@/containers/ConversationPage/Stream/StreamItemAssemblyLine/Assembler/types';
import { OrdinaryPostWrapper } from '../OrdinaryPostWrapper';
import { ISortableModel } from '@/store/base';
import { Post } from 'sdk/module/post/entity';
import { StreamItem, StreamItemType } from '@/containers/ConversationPage/Stream/types';

function runOnAdd({ added, postList, streamItemList, ...rest } : AssemblerAddFuncArgs) {
  const separator = new OrdinaryPostWrapper();
  return separator.onAdd({
    added,
    postList,
    streamItemList,
    ...rest,
  });
}

function runOnDelete(args: AssemblerDelFuncArgs) {
  const separator = new OrdinaryPostWrapper();
  return separator.onDelete(args);
}

describe('OrdinaryPostWrapper', () => {

  describe('onAdd()', () => {
    it('should wrap all the post as StreamItem', () => {
      const separator = runOnAdd(<AssemblerAddFuncArgs>{
        added: [
          {
            id: 620232708,
            sortValue: 1540461821422,
            data: { id:620232708, created_at: 1540461821422 },
          },
        ],
        postList: [] as ISortableModel<Post>[],
        streamItemList: _([] as StreamItem[]),
      });

      expect(separator.streamItemList.size()).toEqual(1);
      expect(separator.streamItemList.value()).toEqual([
        {
          id: 1540461821422,
          type: StreamItemType.POST,
          value: [620232708],
          timeStart: 1540461821422,
        },
      ]);
    });
  });

  describe('onDelete()', () => {
    it('should delete the post in StreamItem', () => {
      const separator = runOnDelete(<AssemblerDelFuncArgs>{
        deleted: [620232708],
        streamItemList: _([
          {
            id: 1540461821422,
            type: StreamItemType.POST,
            value: [620232708],
            timeStart: 1540461821422,
          },
          {
            id: 1540461830617,
            type: StreamItemType.POST,
            value: [620240900],
            timeStart: 1540461830617,
          },
        ]),
      });

      expect(separator.streamItemList.size()).toEqual(1);
      expect(separator.streamItemList.value()).toEqual([
        {
          id: 1540461830617,
          type: StreamItemType.POST,
          value: [620240900],
          timeStart: 1540461830617,
        },
      ]);
    });
  });
});
