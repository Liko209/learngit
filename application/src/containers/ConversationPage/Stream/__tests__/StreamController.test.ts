/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-04-18 19:15:22
 * Copyright © RingCentral. All rights reserved.
 */
import { Post } from 'sdk/module/post/entity';
import { QUERY_DIRECTION } from 'sdk/dao/constants';
import { FetchSortableDataListHandler } from '@/store/base/fetch';
import { ConversationPostFocBuilder } from '@/store/handler/cache/ConversationPostFocBuilder';
import { HistoryHandler } from '../HistoryHandler';
import {
  StreamController,
  BEFORE_ANCHOR_POSTS_COUNT,
} from '../StreamController';
import { StreamItemType } from '../types';

describe('StreamController', () => {
  describe('fetchAllUnreadData()', () => {
    function setup({
      postsNewerThanAnchor,
      postsOlderThanAnchor,
    }: {
      postsNewerThanAnchor: Post[];
      postsOlderThanAnchor: Post[];
    }) {
      const dataProvider = { fetchData: jest.fn().mockName('fetchData()') };
      dataProvider.fetchData
        .mockResolvedValueOnce({ data: postsNewerThanAnchor, hasMore: true })
        .mockResolvedValueOnce({ data: postsOlderThanAnchor, hasMore: false });
      const listHandler = new FetchSortableDataListHandler<Post>(dataProvider, {
        isMatchFunc: () => true,
        transformFunc: (post: Post) => {
          return { id: post.id, sortValue: post.created_at, data: post };
        },
      });
      jest.spyOn(listHandler, 'fetchDataByAnchor');
      jest
        .spyOn(ConversationPostFocBuilder, 'buildConversationPostFoc')
        .mockReturnValue(listHandler);
      const historyHandler = new HistoryHandler();
      const streamController = new StreamController(1, historyHandler, 1);

      return { streamController, listHandler };
    }

    it('should fetch posts newer and older than anchor', async () => {
      const postsNewerThanAnchor = [
        { id: 5, created_at: 105, creator_id: 1 },
        { id: 6, created_at: 106, creator_id: 1 },
        { id: 7, created_at: 107, creator_id: 1 },
        { id: 8, created_at: 108, creator_id: 1 },
      ] as Post[];
      const postsOlderThanAnchor = [
        { id: 1, created_at: 101, creator_id: 1 },
        { id: 2, created_at: 102, creator_id: 1 },
        { id: 3, created_at: 103, creator_id: 1 },
        { id: 4, created_at: 104, creator_id: 1 },
      ] as Post[];

      const { listHandler, streamController } = setup({
        postsNewerThanAnchor,
        postsOlderThanAnchor,
      });
      jest.spyOn(streamController, 'enableNewMessageSep');

      const posts = await streamController.fetchAllUnreadData();

      expect(listHandler.fetchDataByAnchor).toBeCalledTimes(2);
      expect(listHandler.fetchDataByAnchor).toBeCalledWith(
        QUERY_DIRECTION.OLDER,
        BEFORE_ANCHOR_POSTS_COUNT,
        expect.objectContaining({
          id: 5,
          sortValue: 105,
        }),
      );
      expect(streamController.enableNewMessageSep).toBeCalled();
      expect(streamController.items).toEqual([
        { id: 1, type: StreamItemType.INITIAL_POST, timeStart: 1 },
        { id: 101, type: StreamItemType.POST, value: [1], timeStart: 101 },
        { id: 102, type: StreamItemType.POST, value: [2], timeStart: 102 },
        { id: 103, type: StreamItemType.POST, value: [3], timeStart: 103 },
        { id: 104, type: StreamItemType.NEW_MSG_SEPARATOR, timeStart: 104 },
        { id: 105, type: StreamItemType.POST, value: [5], timeStart: 105 },
        { id: 106, type: StreamItemType.POST, value: [6], timeStart: 106 },
        { id: 107, type: StreamItemType.POST, value: [7], timeStart: 107 },
        { id: 108, type: StreamItemType.POST, value: [8], timeStart: 108 },
      ]);
      expect(posts).toEqual([
        {
          id: 1,
          sortValue: 101,
          data: { id: 1, created_at: 101, creator_id: 1 },
        },
        {
          id: 2,
          sortValue: 102,
          data: { id: 2, created_at: 102, creator_id: 1 },
        },
        {
          id: 3,
          sortValue: 103,
          data: { id: 3, created_at: 103, creator_id: 1 },
        },
        {
          id: 4,
          sortValue: 104,
          data: { id: 4, created_at: 104, creator_id: 1 },
        },
        {
          id: 5,
          sortValue: 105,
          data: { id: 5, created_at: 105, creator_id: 1 },
        },
        {
          id: 6,
          sortValue: 106,
          data: { id: 6, created_at: 106, creator_id: 1 },
        },
        {
          id: 7,
          sortValue: 107,
          data: { id: 7, created_at: 107, creator_id: 1 },
        },
        {
          id: 8,
          sortValue: 108,
          data: { id: 8, created_at: 108, creator_id: 1 },
        },
      ]);
    });
  });
});
