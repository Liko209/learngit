/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-27 09:24:24
 * Copyright © RingCentral. All rights reserved.
 */

import { DiscontinuousPosListHandler } from '../DiscontinuousPosListHandler';
import storeManager from '../../base/StoreManager';
import { ENTITY } from 'sdk/service/eventKey';
import { ENTITY_NAME } from '@/store/constants';
import { QUERY_DIRECTION } from 'sdk/dao/constants';
import { PostService } from 'sdk/module/post';
import notificationCenter from 'sdk/service/notificationCenter';

jest.mock('sdk/module/post');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('DiscontinuousPosListHandler', () => {
  const sourceIds: number[] = [];
  for (let i = 1; i < 12; i++) {
    sourceIds.push(i);
  }

  const eventName = ENTITY.NON_CONVERSATION_POST;
  const entityName = ENTITY_NAME.POST;
  let postListHandler: DiscontinuousPosListHandler;
  let postService: PostService;
  function setUp() {
    const store = storeManager.getEntityMapStore(entityName);
    storeManager.removeStore(store);
    postListHandler = new DiscontinuousPosListHandler(sourceIds);
    postService = new PostService();
    PostService.getInstance = jest.fn().mockReturnValue(postService);
  }

  function setUpData() {
    postService.getPostsByIds.mockImplementation(async (ids: number[]) => {
      const models = ids.map((x: number) => {
        return { id: x, deactivated: false };
      });
      return { posts: models, items: [] };
    });
  }

  beforeEach(() => {
    setUp();
  });

  describe('loadMorePosts', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      setUpData();
    });
    it('should update ids after load more posts', async (done: any) => {
      postListHandler.loadMorePosts(QUERY_DIRECTION.NEWER, 10);

      setTimeout(() => {
        expect(postListHandler.ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        done();
      },         1000);
    });
  });

  describe('Receive notification', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      setUpData();
    });

    it('should not update list when receive a non conversation post but not in source list ', async (done: any) => {
      postListHandler.loadMorePosts(QUERY_DIRECTION.NEWER, 10);

      setTimeout(() => {
        // has 10 element before
        expect(postListHandler.ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

        const newPost = { id: 11111111111, text: 'text', deactivated: false };
        notificationCenter.emitEntityUpdate(eventName, [newPost]);

        const store = storeManager.getEntityMapStore(entityName);
        expect(store.has(newPost.id)).toBeFalsy();

        // still has 10 element after
        expect(postListHandler.ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        done();
      },         100);
    });

    it('should update post in the list when receive in range post update', async (done: any) => {
      postListHandler.loadMorePosts(QUERY_DIRECTION.NEWER, 10);

      setTimeout(() => {
        const newPost = { id: 3, text: 'text', deactivated: false };
        notificationCenter.emitEntityUpdate(eventName, [newPost]);

        const store = storeManager.getEntityMapStore(entityName);
        expect(store.has(newPost.id)).toBeTruthy();
        expect(store.get(newPost.id).text).toBe(newPost.text);

        done();
      },         100);
    });
  });

  describe('onSourceIdsChanged', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      setUpData();
    });

    it('should insert new ids to list store when receive new source ids with new ids', async (done: any) => {
      const newSourceIds = [100, 101, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      postListHandler.loadMorePosts(QUERY_DIRECTION.NEWER, 10);
      postListHandler.onSourceIdsChanged(newSourceIds);
      setTimeout(() => {
        expect(postListHandler.ids).toEqual(newSourceIds);
        done();
      },         100);
    });

    it('should delete ids not existed in new source ids', async (done: any) => {
      postListHandler.loadMorePosts(QUERY_DIRECTION.NEWER, 10);

      setTimeout(() => {
        // has 10 element before
        expect(postListHandler.ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

        const newSourceIds = [2, 3, 4, 5, 6];
        postListHandler.onSourceIdsChanged(newSourceIds);

        expect(postListHandler.ids).toEqual(newSourceIds);
        done();
      },         100);
    });
  });
});
