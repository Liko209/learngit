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
      expect(posts.map(post => post.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });
  });
});
