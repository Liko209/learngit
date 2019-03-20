/*
 * @Author: Conner
 * @Date: 2019-03-06 10:15
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { NewMessageSeparatorHandler } from '@/containers/ConversationPage/Stream/StreamItemAssemblyLine/Assembler/NewMessageSeparator';
import { ISortableModel } from '@/store/base';
import { StreamItem, StreamItemType } from '@/containers/ConversationPage/Stream/types';
import {
  AssemblerAddFuncArgs,
  AssemblerDelFuncArgs,
} from '@/containers/ConversationPage/Stream/StreamItemAssemblyLine/Assembler/types';
import * as utils from '@/store/utils';

type OnAddCaseConfig = {
  readThrough?: number;
  postCreatorId?: number;
  currentUserId?: number;
  allPosts: ISortableModel[];
  streamItemList: _.LoDashImplicitWrapper<StreamItem[]>;
  hasMore?: boolean;
  setup?: (separator: NewMessageSeparatorHandler) => void;
};

type OnDeleteCaseConfig = {
  separatorId?: number;
  readThrough?: number;
  deleted?: number[],
  allPosts: ISortableModel[];
  streamItemList: _.LoDashImplicitWrapper<StreamItem[]>;
  setup?: (separator: NewMessageSeparatorHandler) => void;
};

function runOnAdd({
  readThrough = 0,
  postCreatorId = 1,
  currentUserId = 2,
  allPosts,
  streamItemList,
  hasMore = false,
  setup,
}: OnAddCaseConfig) {
  jest.spyOn(utils, 'getGlobalValue').mockReturnValueOnce(currentUserId);

  const separator = new NewMessageSeparatorHandler();
  setup && setup(separator);
  allPosts.forEach(
    item => (item.data = item.data || { creator_id: postCreatorId }),
  );
  return separator.onAdd(<AssemblerAddFuncArgs>{
    hasMore,
    streamItemList,
    readThrough,
    postList: allPosts,
  });
}

function runOnDelete({
  separatorId,
  readThrough,
  deleted,
  allPosts,
  streamItemList,
  setup,
}: OnDeleteCaseConfig) {
  const separator = new NewMessageSeparatorHandler();
  setup && setup(separator);
  return separator.onDelete(<AssemblerDelFuncArgs>{
    deleted,
    streamItemList,
    readThrough,
    postList: allPosts,
  });
}

describe('NewMessageSeparator', () => {

  describe('onAdd()', () => {
    it('should have a separator next to the readThrough post', () => {
      const firstUnreadPost = { id: 620257284, sortValue: 1540461970776, data: { created_at: 1540461970776 } };
      const separator = runOnAdd(<OnAddCaseConfig>{
        streamItemList: _([]),
        readThrough: 620249092,
        allPosts: [
          { id: 620232708, sortValue: 1540461821422 },
          { id: 620240900, sortValue: 1540461830617 },
          { id: 620249092, sortValue: 1540461830964 }, // readThrough is here
          firstUnreadPost,
          { id: 620265476, sortValue: 1540461970958 },
          { id: 620273668, sortValue: 1540461971175 },
          { id: 620281860, sortValue: 1540461972285 },
        ],
      });

      expect(separator.streamItemList.size()).toEqual(1);
      expect(separator.streamItemList.value()).toEqual([
        {
          id: firstUnreadPost.data!.created_at - 1,
          timeStart: firstUnreadPost.data!.created_at - 1,
          type: StreamItemType.NEW_MSG_SEPARATOR,
        },
      ]);
    });

    it('should not modify when old separator already existed', () => {
      const firstUnreadPost = {
        id: 620257284,
        sortValue: 1540461970776,
        data: { created_at: 1540461970776 },
      };
      const existSeparator = {
        id: firstUnreadPost.data!.created_at - 1,
        timeStart: firstUnreadPost.data!.created_at - 1,
        type: StreamItemType.NEW_MSG_SEPARATOR,
      };
      const separator = runOnAdd(<OnAddCaseConfig>{
        setup(separator: any) {
          separator.separatorId = existSeparator.id;
        },
        streamItemList: _([existSeparator]),
        readThrough: 620249092,
        allPosts: [
          { id: 620232708, sortValue: 1540461821422 },
          { id: 620240900, sortValue: 1540461830617 },
          { id: 620249092, sortValue: 1540461830964 }, // readThrough is here
          firstUnreadPost,
          { id: 620265476, sortValue: 1540461970958 },
          { id: 620273668, sortValue: 1540461971175 },
          { id: 620281860, sortValue: 1540461972285 },
        ],
      });

      expect(separator.streamItemList.size()).toEqual(1);
      expect(separator.streamItemList.value()).toEqual([existSeparator]);
    });

    it('should not have a separator when the post already read', () => {
      const separator = runOnAdd(<OnAddCaseConfig>{
        streamItemList: _([]),
        readThrough: 620281860,
        allPosts: [
          { id: 620232708, sortValue: 1540461821422 },
          { id: 620240900, sortValue: 1540461830617 },
          { id: 620249092, sortValue: 1540461830964 },
          { id: 620257284, sortValue: 1540461970776 },
          { id: 620265476, sortValue: 1540461970958 },
          { id: 620273668, sortValue: 1540461971175 },
          { id: 620281860, sortValue: 1540461972285 },
        ],
      });

      expect(separator.streamItemList.size()).toEqual(0);
      expect(separator.streamItemList.value()).toEqual([]);
    });

    it('should have a separator when readThrough post is in prev page', () => {
      const separator = runOnAdd(<OnAddCaseConfig>{
        readThrough: 999,
        streamItemList: _([] as StreamItem[]),
        allPosts: [
          { id: 1000, sortValue: 3 },
          { id: 1001, sortValue: 4 },
          { id: 1002, sortValue: 5 },
        ],
      });

      expect(separator.streamItemList.size()).toEqual(0);
    });

    it('should not add separator when the post is send by current user', () => {
      const separator = runOnAdd(<OnAddCaseConfig>{
        postCreatorId: 1,
        currentUserId: 1,
        streamItemList: _([]),
        allPosts: [
          { id: 620232708, sortValue: 1540461821422, data: { creator_id: 1 } },
          { id: 620240900, sortValue: 1540461830617, data: { creator_id: 1 } },
          { id: 620249092, sortValue: 1540461830964, data: { creator_id: 1 } },
          { id: 620265476, sortValue: 1540461970958, data: { creator_id: 1 } },
          { id: 620273668, sortValue: 1540461971175, data: { creator_id: 1 } },
          { id: 620281860, sortValue: 1540461972285, data: { creator_id: 1 } },
        ],
      });

      expect(separator.streamItemList.size()).toEqual(0);
    });

    it('should have not separator when readThrough is empty and hasMore=true', () => {
      // In this case separator not in current page
      const separator = runOnAdd(<OnAddCaseConfig>{
        readThrough: undefined,
        streamItemList: _([]),
        allPosts: [
          { id: 1000, sortValue: 1 },
          { id: 1001, sortValue: 2 },
          { id: 1002, sortValue: 3 },
        ],
        hasMore: true,
      });

      expect(separator.streamItemList.size()).toBe(0);
    });

    // Boundary test
    it('should not have a separator when no post', () => {
      const separator1 = runOnAdd(<OnAddCaseConfig>{
        readThrough: undefined,
        streamItemList: _([]),
        allPosts: [],
      });

      expect(separator1.streamItemList.size()).toBe(0);

      // If the conversation used to have posts but had been deleted.
      const separator2 = runOnAdd({
        readThrough: 1,
        streamItemList: _([]),
        allPosts: [],
      });

      expect(separator2.streamItemList.size()).toBe(0);
    });

    it('should have a separator when readThrough post is not existed', () => {
      const separator = runOnAdd(<OnAddCaseConfig>{
        readThrough: 1000,
        streamItemList: _([]),
        allPosts: [
          { id: 999, sortValue: 1 },
          { id: 1001, sortValue: 2 },
          { id: 1002, sortValue: 3 },
        ],
      });

      expect(separator.streamItemList.size()).toEqual(1);
      expect(separator.streamItemList.value()[0]).toHaveProperty('type', StreamItemType.NEW_MSG_SEPARATOR);
    });

    it('should have separator when readThrough is empty and hasMore=false', () => {
      // In this case, first unread post is the first post
      const separator = runOnAdd(<OnAddCaseConfig>{
        readThrough: undefined,
        streamItemList: _([]),
        allPosts: [
          { id: 1000, sortValue: 1 },
          { id: 1001, sortValue: 2 },
          { id: 1002, sortValue: 3 },
        ],
        hasMore: false,
      });

      expect(separator.streamItemList.size()).toBe(1);
      expect(separator.streamItemList.value()[0]).toHaveProperty('type', StreamItemType.NEW_MSG_SEPARATOR);
    });

    it('should have not separator when readThrough === last post', () => {
      const separator = runOnAdd(<OnAddCaseConfig>{
        readThrough: 1002,
        streamItemList: _([]),
        allPosts: [
          { id: 1000, sortValue: 1 },
          { id: 1001, sortValue: 2 },
          { id: 1002, sortValue: 3 },
        ],
      });

      expect(separator.streamItemList.size()).toBe(0);
    });

    it('should have not separator when readThrough > last post', () => {
      const separator = runOnAdd(<OnAddCaseConfig>{
        readThrough: 1003,
        streamItemList: _([]),
        allPosts: [
          { id: 1000, sortValue: 1 },
          { id: 1001, sortValue: 2 },
          { id: 1002, sortValue: 3 },
        ],
      });

      expect(separator.streamItemList.size()).toBe(0);
    });

    it('should do nothing when it was disabled', () => {
      const separator = runOnAdd(<OnAddCaseConfig>{
        readThrough: 1001,
        streamItemList: _([]),
        allPosts: [{ id: 1000, sortValue: 1 }],
        setup(separator) {
          separator.disable();
        },
      });

      expect(separator.streamItemList.size()).toBe(0);
    });

    it('should work when it was enabled', () => {
      const separator = runOnAdd(<OnAddCaseConfig>{
        setup(separator) {
          separator.disable();
          separator.enable();
        },
        readThrough: 620249092,
        streamItemList: _([]),
        allPosts: [
          { id: 620232708, sortValue: 1540461821422 },
          { id: 620240900, sortValue: 1540461830617 },
          { id: 620249092, sortValue: 1540461830964 }, // readThrough is here
          { id: 620257284, sortValue: 1540461970776 },
          { id: 620265476, sortValue: 1540461970958 },
          { id: 620273668, sortValue: 1540461971175 },
          { id: 620281860, sortValue: 1540461972285 },
        ],
      });

      expect(separator.streamItemList.size()).toBe(1);
      expect(separator.streamItemList.value()[0]).toHaveProperty('type', StreamItemType.NEW_MSG_SEPARATOR);
    });
  });

  describe('onDelete()', () => {
    it('should do nothing when no message separator exists already',  () => {
      const separator = runOnDelete(<OnDeleteCaseConfig>{
        deleted: [620232708, 620273668],
        streamItemList: _([]),
        allPosts: [
          { id: 620232708, sortValue: 1540461821422 },
          { id: 620240900, sortValue: 1540461830617 },
          { id: 620249092, sortValue: 1540461830964 },
          { id: 620265476, sortValue: 1540461970958 },
          { id: 620273668, sortValue: 1540461971175 },
          { id: 620281860, sortValue: 1540461972285 },
        ],
      });

      expect(separator.streamItemList.size()).toEqual(0);
      expect(separator.streamItemList.value()).toEqual([]);
    });

    it('should remove the new message separator when no following message',  () => {
      const unReadPost = {
        id: 620257284,
        sortValue: 1540461970776,
        data: { created_at: 1540461970776 },
      };
      const unReadPostStream = {
        id: 1540461970776,
        type: StreamItemType.POST,
        timeStart: 1540461970776,
        value: [620257284],
      };
      const existNewMsgSeparator = {
        id: unReadPost.data!.created_at - 1,
        timeStart: unReadPost.data!.created_at - 1,
        type: StreamItemType.NEW_MSG_SEPARATOR,
      };
      const separator = runOnDelete(<OnDeleteCaseConfig>{
        setup(separator: any) {
          separator.separatorId = existNewMsgSeparator.id;
        },
        deleted: [620257284],
        streamItemList: _([
          existNewMsgSeparator,
          unReadPostStream,
        ]),
        allPosts: [],
      });
      expect(separator.streamItemList.value().length).toEqual(1);
      expect(separator.streamItemList.value()).toEqual([unReadPostStream]);
    });

    it('should not remove the separator when it is followed by a message',  () => {
      const firstUnreadPost = {
        id: 620257284,
        sortValue: 1540461970776,
        data: { created_at: 1540461970776 },
      };
      const existSeparator = {
        id: firstUnreadPost.data!.created_at - 1,
        timeStart: firstUnreadPost.data!.created_at - 1,
        type: StreamItemType.NEW_MSG_SEPARATOR,
      };
      const separator = runOnDelete(<OnDeleteCaseConfig>{
        setup(separator: any) {
          separator.separatorId = existSeparator.id;
        },
        deleted: [620232708, 620273668],
        streamItemList: _([existSeparator]),
        allPosts: [
          { id: 620240900, sortValue: 1540461830617 },
          { id: 620249092, sortValue: 1540461830964 }, // readThrough is here
          firstUnreadPost,
          { id: 620265476, sortValue: 1540461970958 },
          { id: 620281860, sortValue: 1540461972285 },
        ],
      });

      expect(separator.streamItemList.size()).toEqual(1);
      expect(separator.streamItemList.value()).toEqual([existSeparator]);
    });
  });
});
