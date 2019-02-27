import postCacheController from '@/containers/ConversationPage/Stream/cache/PostCacheController';
import PrefetchPostProcessor from '../PrefetchPostProcessor';
jest.mock('sdk/api');
beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});
describe('PrefetchPostProcessor', () => {
  describe('process()', () => {
    it('should call fetchData once when postCacheController has groupId', () => {
      const prefetchPostProcessor = new PrefetchPostProcessor(2);
      const spy = jest
        .spyOn(
          postCacheController.get(prefetchPostProcessor._groupId),
          'fetchData',
        )
        .mockResolvedValue(1);
      jest.spyOn(postCacheController, 'has').mockReturnValueOnce(false);
      prefetchPostProcessor.process();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should not call fetchData when postCacheController has not groupId', () => {
      const prefetchPostProcessor = new PrefetchPostProcessor(3);
      const spy = jest
        .spyOn(
          postCacheController.get(prefetchPostProcessor._groupId),
          'fetchData',
        )
        .mockResolvedValue(1);
      jest.spyOn(postCacheController, 'has').mockReturnValueOnce(true);
      prefetchPostProcessor.process();
      expect(spy).toHaveBeenCalledTimes(0);
    });
  });
});
