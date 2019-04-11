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
import { ServiceLoader } from 'sdk/module/serviceLoader';

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

  const eventName = ENTITY.DISCONTINUOUS_POST;
  const entityName = ENTITY_NAME.POST;
  let postListHandler: DiscontinuousPosListHandler;
  let postService: PostService;
  function setUp() {
    notificationCenter.removeAllListeners(eventName);
    const store = storeManager.getEntityMapStore(entityName);
    storeManager.removeStore(store);
    postListHandler = new DiscontinuousPosListHandler(sourceIds);
    postService = new PostService();
    ServiceLoader.getInstance = jest.fn().mockReturnValue(postService);
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
      },         100);
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
        const newPost = { id: 11111111111, text: 'text', deactivated: false };
        notificationCenter.emitEntityUpdate(eventName, [newPost]);

        const store = storeManager.getEntityMapStore(entityName);
        expect(store.has(newPost.id)).toBeFalsy();

        // still has 10 element after
        expect(postListHandler.ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        done();
      },         100);
    });
  });

  describe('onSourceIdsChanged', () => {
    beforeEach(async () => {
      clearMocks();
      setUp();
      setUpData();
      postListHandler.loadMorePosts(QUERY_DIRECTION.NEWER, 10);

      await waitFunc();
    });

    async function waitFunc() {
      const promise = new Promise((resolve: any, reject: any) => {
        setTimeout(() => {
          resolve();
        },         100);
      });
      await Promise.all([promise]);
    }

    it.each`
      newSourceIds                                 | expectedRes
      ${[100, 101, 1, 3, 2, 4, 5, 6, 7, 8, 9, 10]} | ${[100, 101, 1, 3, 2, 4, 5, 6, 7, 8, 9, 10]}
      ${[2, 3, 4, 5, 6]}                           | ${[2, 3, 4, 5, 6]}
      ${[10, 9, 2, 3, 5, 4, 6, 7, 8, 1]}           | ${[10, 9, 2, 3, 5, 4, 6, 7, 8, 1]}
      ${[10, 9, 2, 3, 5, 6, 7, 8, 1]}              | ${[10, 9, 2, 3, 5, 6, 7, 8, 1]}
    `(
      'should return expected ids: $newSourceIds,  $expectedRes',
      async ({ newSourceIds, expectedRes }) => {
        postListHandler.onSourceIdsChanged(newSourceIds);
        await waitFunc();
        expect(postListHandler.ids).toEqual(expectedRes);
      },
    );
  });
});
