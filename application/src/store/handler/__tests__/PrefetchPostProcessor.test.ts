/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-02-28 13:17:56
 * Copyright © RingCentral. All rights reserved.
 */
import PrefetchPostProcessor from '../PrefetchPostProcessor';
import { ICacheController } from '@/containers/ConversationPage/Stream/cache/ICacheController';
import { Post } from 'sdk/module/post/entity';

jest.mock('sdk/api');
class TestCacheController implements ICacheController<Post> {
  has(groupId: number): boolean {
    throw new Error('Method not implemented.');
  }
  get(
    groupId: number,
    jump2PostId?: number | undefined,
  ): import('../../base').FetchSortableDataListHandler<Post> {
    throw new Error('Method not implemented.');
  }
}

describe('PrefetchPostProcessor', () => {
  let testCacheController: TestCacheController;
  let prefetchPostProcessor: PrefetchPostProcessor;
  beforeEach(() => {
    testCacheController = new TestCacheController();
    prefetchPostProcessor = new PrefetchPostProcessor(2, testCacheController);
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  describe('process()', () => {
    it('should call fetchData once when testCacheController has no groupId', async () => {
      jest.spyOn(testCacheController, 'has').mockReturnValue(false);
      jest.spyOn(testCacheController, 'get').mockReturnValue({
        hasMore: jest.fn(() => true),
        listStore: new Map(),
        fetchData: jest.fn(() => true),
      });
      const spy = jest.spyOn(
        testCacheController.get(prefetchPostProcessor._groupId),
        'fetchData',
      );
      await prefetchPostProcessor.process();
      expect(spy).toHaveBeenCalledTimes(1);
    });
    it('should call fetchData once when postCacheController has groupId and listHandler hasMore and listHandler.listStore.size is 0', async () => {
      jest.spyOn(testCacheController, 'has').mockReturnValue(true);
      jest.spyOn(testCacheController, 'get').mockReturnValue({
        hasMore: jest.fn(() => true),
        listStore: new Map(),
        fetchData: jest.fn(() => true),
      });
      const spy = jest.spyOn(
        testCacheController.get(prefetchPostProcessor._groupId),
        'fetchData',
      );
      await prefetchPostProcessor.process();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should not call fetchData when postCacheController has groupId and listHandler hasMore and listHandler.listStore.size is 1', async () => {
      jest.spyOn(testCacheController, 'has').mockReturnValue(true);
      jest.spyOn(testCacheController, 'get').mockReturnValue({
        hasMore: jest.fn(() => true),
        listStore: new Map([[1, '1']]),
        fetchData: jest.fn(() => true),
      });
      const spy = jest.spyOn(
        testCacheController.get(prefetchPostProcessor._groupId),
        'fetchData',
      );
      await prefetchPostProcessor.process();
      expect(spy).toHaveBeenCalledTimes(0);
    });
  });
  describe('canContinue()', () => {
    it('should return true', () => {
      const result = prefetchPostProcessor.canContinue();
      expect(result).toBeTruthy();
    });
  });
  describe('name()', () => {
    it('should return 2 when groupId is 2', () => {
      const result = prefetchPostProcessor.name();
      expect(result).toBe('2');
    });
  });
});
