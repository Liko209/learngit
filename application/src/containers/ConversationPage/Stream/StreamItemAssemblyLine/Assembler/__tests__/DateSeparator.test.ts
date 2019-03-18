/*
 * @Author: Conner
 * @Date: 2019-03-06 10:35
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import moment from 'moment';
import { DateSeparator } from '../DateSeparator';
import { AssemblerAddFuncArgs, AssemblerDelFuncArgs } from '../types';
import { StreamItem, StreamItemType } from '@/containers/ConversationPage/Stream/types';
import { ISortableModel } from '@/store/base';
import { Post } from 'sdk/module/post/entity';

const DATE_2019_03_05 = moment(1551715200000).valueOf();

const DATE_2019_03_04 = moment(1551715200000)
  .subtract(1, 'day')
  .valueOf();

const DATE_2019_03_03 = moment(1551715200000)
  .subtract(2, 'day')
  .valueOf();

function runOnAdd({ added, postList, streamItemList, ...rest } : AssemblerAddFuncArgs) {
  const separator = new DateSeparator();
  return separator.onAdd({
    added,
    postList,
    streamItemList,
    ...rest,
  });
}

function runOnDelete(args: AssemblerDelFuncArgs) {
  const separator = new DateSeparator();
  return separator.onDelete(args);
}

describe('DateSeparator', () => {

  describe('onAdd()', () => {
    it('should have separator for each day', () => {
      const separator = runOnAdd(<AssemblerAddFuncArgs>{
        added: [
          {
            id: 1001,
            sortValue: DATE_2019_03_05,
            data: { created_at: DATE_2019_03_05 },
          },
          {
            id: 1002,
            sortValue: DATE_2019_03_04,
            data: { created_at: DATE_2019_03_04 },
          },
          {
            id: 1003,
            sortValue: DATE_2019_03_03,
            data: { created_at: DATE_2019_03_03 },
          },
        ],
        postList: [] as ISortableModel<Post>[],
        streamItemList: _([] as StreamItem[]),
      });

      expect(separator.streamItemList.value()).toEqual([
        { id: DATE_2019_03_05, timeStart: DATE_2019_03_05, type: StreamItemType.DATE_SEPARATOR },
        { id: DATE_2019_03_04, timeStart: DATE_2019_03_04, type: StreamItemType.DATE_SEPARATOR },
        { id: DATE_2019_03_03, timeStart: DATE_2019_03_03, type: StreamItemType.DATE_SEPARATOR },
      ]);
    });

    it('should have separator when many posts at same day', () => {
      const separator = runOnAdd(<AssemblerAddFuncArgs>{
        added: [
          {
            id: 1001,
            sortValue: DATE_2019_03_05,
            data: { created_at: DATE_2019_03_05 },
          },
          {
            id: 1002,
            sortValue: DATE_2019_03_04,
            data: { created_at: DATE_2019_03_04 },
          },
          {
            id: 1003,
            sortValue: DATE_2019_03_04 + 1000,
            data: { created_at: DATE_2019_03_04 + 1000 },
          },
          {
            id: 1004,
            sortValue: DATE_2019_03_04 + 2000,
            data: { created_at: DATE_2019_03_04 + 2000 },
          },
        ],
        postList: [] as ISortableModel<Post>[],
        streamItemList: _([] as StreamItem[]),
      });

      expect(separator.streamItemList.size()).toBe(2);
      expect(separator.streamItemList.value()).toEqual([
        { id: DATE_2019_03_05, timeStart: DATE_2019_03_05, type: StreamItemType.DATE_SEPARATOR },
        { id: DATE_2019_03_04, timeStart: DATE_2019_03_04, type: StreamItemType.DATE_SEPARATOR },
      ]);

    });
  });

  describe('onDelete()', () => {
    it('should return arguments for next pipeline', () => {
      const args: AssemblerDelFuncArgs = {
        deleted: [],
        postList: [],
        streamItemList: _([] as StreamItem[]),
        readThrough: 0,
      };

      expect(runOnDelete(args)).toEqual(args);
    });
  });
});
