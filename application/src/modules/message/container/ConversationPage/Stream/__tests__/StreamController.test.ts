/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-04-18 19:15:22
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { Post } from 'sdk/module/post/entity';
import { QUERY_DIRECTION } from 'sdk/dao';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { PostService } from 'sdk/module/post/service/PostService';
import { FetchSortableDataListHandler } from '@/store/base/fetch';
import { ConversationPostFocBuilder } from '@/store/handler/cache/ConversationPostFocBuilder';
import { HistoryHandler } from '../HistoryHandler';
import {
  StreamController,
} from '../StreamController';
import { StreamItemType } from '../types';
import storeManager, { ENTITY_NAME } from '@/store';
import GroupStateModel from '@/store/models/GroupState';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import { GroupState } from 'sdk/module/state/entity';

jest.mock('sdk/dao');

describe('StreamController', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('fetchAllUnreadData()', () => {
    function setup({
      groupId,
      readThrough,
      unreadCount,
      currentPosts,
      postsNewerThanAnchor,
    }: {
      groupId: number;
      readThrough: number;
      unreadCount: number;
      currentPosts: Post[];
      postsNewerThanAnchor: Post[];
    }) {
      const store = storeManager.getEntityMapStore(
        ENTITY_NAME.GROUP_STATE,
      ) as MultiEntityMapStore<GroupState, GroupStateModel>;
      store.set({
        read_through: readThrough,
        unread_count: unreadCount,
        id: groupId,
      } as GroupState);
      const dataProvider = { fetchData: jest.fn().mockName('fetchData()') };
      const postService = ServiceLoader.getInstance<PostService>(
        ServiceConfig.POST_SERVICE,
      );
      jest.spyOn(postService, 'getUnreadPostsByGroupId').mockResolvedValueOnce({
        posts: postsNewerThanAnchor.reverse(),
        items: [],
        hasMore: {
          older: false,
          newer: false,
          both: false,
        },
      });
      const listHandler = new FetchSortableDataListHandler<Post>(dataProvider, {
        isMatchFunc: () => true,
        transformFunc: (post: Post) => {
          return { id: post.id, sortValue: post.created_at, data: post };
        },
      });
      const historyHandler = new HistoryHandler();
      historyHandler.update(
        { readThrough, unreadCount, id: groupId } as GroupStateModel,
        _.map(currentPosts, 'id'),
      );
      jest
        .spyOn(ConversationPostFocBuilder, 'buildConversationPostFoc')
        .mockReturnValue(listHandler);
      const streamController = new StreamController(groupId, historyHandler, 1);
      streamController.disableNewMessageSep();
      listHandler.upsert(currentPosts);
      streamController.enableNewMessageSep();

      return { streamController, postService, listHandler };
    }

    it('should fetch posts newer and older than anchor', async () => {
      const currentPosts = [
        { id: 9, created_at: 109, creator_id: 1 },
      ] as Post[];
      const postsNewerThanAnchor = [
        { id: 3, created_at: 103, creator_id: 1 },
        { id: 4, created_at: 104, creator_id: 1 },
        { id: 5, created_at: 105, creator_id: 1 },
        { id: 6, created_at: 106, creator_id: 1 },
        { id: 7, created_at: 107, creator_id: 1 },
        { id: 8, created_at: 108, creator_id: 1 },
      ] as Post[];

      const { streamController } = setup({
        groupId: 1,
        readThrough: 4,
        unreadCount: 4,
        currentPosts,
        postsNewerThanAnchor,
      });
      jest.spyOn(streamController, 'enableNewMessageSep');

      const posts = await streamController.fetchAllUnreadData();

      expect(streamController.enableNewMessageSep).toBeCalled();
      expect(posts).toEqual([
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
        {
          id: 9,
          sortValue: 109,
          data: { id: 9, created_at: 109, creator_id: 1 },
        },
      ]);

      expect(streamController.items).toEqual([
        { id: 1, type: StreamItemType.INITIAL_POST, timeStart: 1 },
        { id: 103, type: StreamItemType.POST, value: 3, timeStart: 103 },
        { id: 104, type: StreamItemType.NEW_MSG_SEPARATOR, timeStart: 104 },
        { id: 105, type: StreamItemType.POST, value: 5, timeStart: 105 },
        { id: 106, type: StreamItemType.POST, value: 6, timeStart: 106 },
        { id: 107, type: StreamItemType.POST, value: 7, timeStart: 107 },
        { id: 108, type: StreamItemType.POST, value: 8, timeStart: 108 },
        { id: 109, type: StreamItemType.POST, value: 9, timeStart: 109 },
      ]);

      //
      // FIJI-5662
      // https://jira.ringcentral.com/browse/FIJI-5662
      // should be the newer direction's hasMore value
      //
      expect(streamController.hasMore(QUERY_DIRECTION.NEWER)).toBeFalsy();
    });

    it('should return [] when current posts is empty', async () => {
      const currentPosts = [] as Post[];
      const postsNewerThanAnchor = [
        { id: 3, created_at: 103, creator_id: 1 },
        { id: 4, created_at: 104, creator_id: 1 },
        { id: 5, created_at: 105, creator_id: 1 },
        { id: 6, created_at: 106, creator_id: 1 },
        { id: 7, created_at: 107, creator_id: 1 },
        { id: 8, created_at: 108, creator_id: 1 },
      ] as Post[];

      const { streamController } = setup({
        groupId: 1,
        readThrough: 4,
        unreadCount: 4,
        currentPosts,
        postsNewerThanAnchor,
      });
      jest.spyOn(streamController, 'enableNewMessageSep');

      const posts = await streamController.fetchAllUnreadData();

      expect(posts).toHaveLength(0);
      expect(streamController.items).toHaveLength(0);
    });
  });
});
