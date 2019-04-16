/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-14 12:27:13
 * Copyright © RingCentral. All rights reserved.
 */
import { isObservableProp } from 'mobx';
import GroupStateModel from '@/store/models/GroupState';
import { HistoryHandler } from '../HistoryHandler';

type RunUpdateOptions = {
  groupState?: Partial<GroupStateModel>;
  postIds: number[];
};

type SetupOptions = {
  groupState?: Partial<GroupStateModel>;
  latestPostId?: number | null;
};

function runUpdate({ groupState, postIds }: RunUpdateOptions) {
  const handler = new HistoryHandler();
  handler.update(groupState as GroupStateModel, postIds);
  return handler;
}

function setup({ groupState, latestPostId }: SetupOptions) {
  const handler = new HistoryHandler();
  if (groupState) {
    handler.groupState = groupState as GroupStateModel;
  }
  if (latestPostId) {
    handler.latestPostId = latestPostId;
  }
  return handler;
}

describe('HistoryHandler', () => {
  describe('latestPostId', () => {
    it('should be observable', () => {
      const handler = setup({
        latestPostId: 1,
        groupState: {},
      });

      expect(isObservableProp(handler, 'latestPostId')).toBeTruthy();
      expect(isObservableProp(handler, 'groupState')).toBeTruthy();
    });
  });

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
      expect(handler.latestPostId).toBe(5);
    });

    it('should set latestPostId to null when postIds is []', () => {
      const updateOptions = {
        postIds: [],
      };

      const handler = runUpdate(updateOptions);

      expect(handler.latestPostId).toBe(null);
    });
  });

  describe('clear()', () => {
    it('should clear history state', () => {
      const handler = setup({
        groupState: {},
        latestPostId: 5,
      });

      handler.clear();

      expect(handler.groupState).toBe(null);
      expect(handler.latestPostId).toBe(null);
    });
  });

  describe('get unreadCount() / get hasUnread()', () => {
    it('should return unreadCount', () => {
      const handler = setup({
        groupState: { unreadCount: 1 },
      });
      expect(handler.unreadCount).toBe(1);
      expect(handler.hasUnread).toBeTruthy();
    });

    it('should return 0 when no groupState', () => {
      const handler = new HistoryHandler();
      expect(handler.unreadCount).toBe(0);
      expect(handler.hasUnread).toBeFalsy();
    });

    it('should return 0 when no groupState.unreadCount is undefined', () => {
      const handler = setup({
        groupState: { unreadCount: undefined },
      });
      expect(handler.unreadCount).toBe(0);
    });
  });

  describe('getPostsOrderThanLatest()', () => {
    it('should return posts before latest post', () => {
      const latestPostId = 5;
      const postIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];

      const handler = setup({ latestPostId });
      const posts = handler.getPostsOrderThanLatest(postIds);

      expect(posts).toEqual([1, 2, 3, 4, 5]);
    });

    it('should return [] when latestPostId is null', () => {
      const latestPostId = null;
      const postIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];

      const handler = setup({ latestPostId });
      const posts = handler.getPostsOrderThanLatest(postIds);

      expect(posts).toEqual([]);
    });
  });

  describe('getFirstUnreadPostId()', () => {
    it('should return first unread post by readThrough when readThrough > 0', () => {
      const readThrough = 2;
      const latestPostId = 5;
      const postIds = [1, 2, 3, 4, 5];
      const hasMore = false;

      const handler = setup({ latestPostId, groupState: { readThrough } });
      const postId = handler.getFirstUnreadPostId(postIds, hasMore);

      expect(postId).toBe(3);
    });

    it('should return first post id in postIds when readThrough === 0', () => {
      const readThrough = 0;
      const latestPostId = 5;
      const postIds = [1, 2, 3, 4, 5];
      const hasMore = false;

      const handler = setup({ latestPostId, groupState: { readThrough } });
      const postId = handler.getFirstUnreadPostId(postIds, hasMore);

      expect(postId).toBe(1);
    });

    it('should return undefined when can not find first unread in postIds and hasMore', () => {
      const readThrough = 1;
      const latestPostId = 9;
      const postIds = [6, 7, 8, 9];
      const hasMore = true;

      const handler = setup({ latestPostId, groupState: { readThrough } });
      const postId = handler.getFirstUnreadPostId(postIds, hasMore);

      expect(postId).toBe(undefined);
    });

    it('should return undefined when readThrough === 0 and postIds is empty', () => {
      const readThrough = 0;
      const latestPostId = 5;
      const postIds: number[] = [];
      const hasMore = false;

      const handler = setup({ latestPostId, groupState: { readThrough } });
      const postId = handler.getFirstUnreadPostId(postIds, hasMore);

      expect(postId).toBe(undefined);
    });
  });

  describe('getDistanceToFirstUnread()', () => {
    it('should return distance to first unread', () => {
      const unreadCount = 10;
      const latestPostId = 5;
      const postIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];

      const handler = setup({ latestPostId, groupState: { unreadCount } });
      const distance = handler.getDistanceToFirstUnread(postIds);

      expect(distance).toBe(5);
    });
  });
});
