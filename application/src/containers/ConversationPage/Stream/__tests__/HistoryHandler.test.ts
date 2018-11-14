/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-14 12:27:13
 * Copyright © RingCentral. All rights reserved.
 */
import GroupStateModel from '@/store/models/GroupState';
import { HistoryHandler } from '../HistoryHandler';

type RunUpdateOptions = {
  groupState?: Partial<GroupStateModel>;
  postIds: number[];
};

type SetupOptions = {
  groupState?: Partial<GroupStateModel>;
  newestPostId?: number | null;
};

function runUpdate({ groupState, postIds }: RunUpdateOptions) {
  const handler = new HistoryHandler();
  handler.update(groupState as GroupStateModel, postIds);
  return handler;
}

function setup({ groupState, newestPostId }: SetupOptions) {
  const handler = new HistoryHandler();
  if (groupState) {
    handler.groupState = groupState as GroupStateModel;
  }
  if (newestPostId) {
    handler.newestPostId = newestPostId;
  }
  return handler;
}

describe('HistoryHandler', () => {
  describe('update()', () => {
    it('should update history state', () => {
      const updateOptions = {
        groupState: {
          id: 10,
          unreadCount: 0,
          unreadMentionsCount: 0,
          readThrough: 0,
          lastReadThrough: 0,
        },
        postIds: [1, 2, 3, 4, 5],
      };

      const handler = runUpdate(updateOptions);

      expect(handler.groupState).toEqual(updateOptions.groupState);
      expect(handler.newestPostId).toBe(5);
    });

    it('should set newestPostId to null when postIds is []', () => {
      const updateOptions = {
        postIds: [],
      };

      const handler = runUpdate(updateOptions);

      expect(handler.newestPostId).toBe(null);
    });
  });

  describe('clear()', () => {
    it('should clear history state', () => {
      const handler = setup({
        groupState: {},
        newestPostId: 5,
      });

      handler.clear();

      expect(handler.groupState).toBe(null);
      expect(handler.newestPostId).toBe(null);
    });
  });

  describe('get unreadCount()', () => {
    it('should return unreadCount', () => {
      const handler = setup({
        groupState: { unreadCount: 1 },
      });
      expect(handler.unreadCount).toBe(1);
    });

    it('should return 0 when no groupState', () => {
      const handler = new HistoryHandler();
      expect(handler.unreadCount).toBe(0);
    });

    it('should return 0 when no groupState.unreadCount is undefined', () => {
      const handler = setup({
        groupState: { unreadCount: undefined },
      });
      expect(handler.unreadCount).toBe(0);
    });
  });

  describe('getPostsBeforeNewest()', () => {
    it('should return posts before newest post', () => {
      const newestPostId = 5;
      const postIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];

      const handler = setup({ newestPostId });
      const posts = handler.getPostsLteNewest(postIds);

      expect(posts).toEqual([1, 2, 3, 4, 5]);
    });

    it('should return [] when newestPostId is null', () => {
      const newestPostId = null;
      const postIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];

      const handler = setup({ newestPostId });
      const posts = handler.getPostsLteNewest(postIds);

      expect(posts).toEqual([]);
    });
  });

  describe('getDistanceToFirstUnread()', () => {
    it('should return distance to first unread', () => {
      const unreadCount = 10;
      const newestPostId = 5;
      const postIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];

      const handler = setup({ newestPostId, groupState: { unreadCount } });
      const distance = handler.getDistanceToFirstUnread(postIds);

      expect(distance).toBe(5);
    });
  });
});
