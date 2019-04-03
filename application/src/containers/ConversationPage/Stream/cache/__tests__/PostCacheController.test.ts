/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2019-02-04 10:02:33
 * Copyright © RingCentral. All rights reserved.
 */

import { PostCacheController } from '../PostCacheController';
import { FetchSortableDataListHandler } from '@/store/base';

jest.mock('sdk/api');

describe('PostCacheController', () => {
  let postCacheController: PostCacheController;
  beforeEach(() => {
    postCacheController = new PostCacheController();
    postCacheController._currentGroupId = 0;
    postCacheController._cacheMap = new Map([[2, [{}]], [3, [{}]]]);
  });

  describe('get()', () => {
    it('should return listHandler when jump2PostId is undefined and groupId is in cacheMap', () => {
      const listHandler = postCacheController._cacheMap.get(2);
      const result = postCacheController.get(2);
      expect(result).toBe(listHandler);
    });

    it('should return FetchSortableDataListHandler type when jump2PostId is undefined and groupId not in cacheMap', () => {
      jest
        .spyOn(postCacheController, 'set')
        .mockImplementation((groupId, listHandler) => {
          expect(groupId).toBe(4);
          expect(
            listHandler instanceof FetchSortableDataListHandler,
          ).toBeTruthy();
        });
      const result = postCacheController.get(4);
      expect(result instanceof FetchSortableDataListHandler).toBeTruthy();
    });

    it('should return FetchSortableDataListHandler type when jump2PostId is 1', () => {
      const result = postCacheController.get(2, 1);
      expect(jest.spyOn(postCacheController, 'set').mock.calls.length).toBe(0);
      expect(result instanceof FetchSortableDataListHandler).toBeTruthy();
    });
  });

  describe('releaseCurrentConversation()', () => {
    it('should not remove groupId from cache when groupId is not currentGroupId', () => {
      postCacheController._currentGroupId = 1;
      jest
        .spyOn(postCacheController, 'get')
        .mockReturnValue({ dispose: () => {} });
      postCacheController.releaseCurrentConversation(2);
      expect(postCacheController._cacheMap.has(2)).toBeTruthy();
      expect(postCacheController._currentGroupId).toBe(1);
    });

    it('should remove groupId from cache when groupId is currentGroupId', () => {
      postCacheController._currentGroupId = 2;
      jest
        .spyOn(postCacheController, 'get')
        .mockReturnValue({ dispose: () => {} });
      postCacheController.releaseCurrentConversation(2);
      expect(postCacheController._cacheMap.has(2)).toBeFalsy();
      expect(postCacheController._currentGroupId).toBe(0);
    });
  });

  describe('remove()', () => {
    it('should not remove groupId from cache when groupId not in cacheMap', () => {
      jest.spyOn(postCacheController, 'has').mockReturnValue(false);
      postCacheController.remove(2);
      expect(postCacheController._cacheMap.has(2)).toBeTruthy();
    });
    it('should remove groupId from cache when groupId in cacheMap and not current groupId', () => {
      jest.spyOn(postCacheController, 'has').mockReturnValue(true);
      jest
        .spyOn(postCacheController, 'get')
        .mockReturnValue({ dispose: () => {} });
      postCacheController.remove(2);
      expect(postCacheController._cacheMap.has(2)).toBeFalsy();
    });

    it('should not remove groupId from cache when groupId in cacheMap and is current groupId', () => {
      jest.spyOn(postCacheController, 'has').mockReturnValue(true);
      postCacheController._currentGroupId = 2;
      postCacheController.remove(2);
      expect(postCacheController._cacheMap.has(2)).toBeTruthy();
    });
  });
});
