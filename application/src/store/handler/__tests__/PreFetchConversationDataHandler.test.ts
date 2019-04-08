/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-02 21:20:21
 * Copyright © RingCentral. All rights reserved.
 */

import { PreFetchConversationDataHandler } from '../PreFetchConversationDataHandler';
import { PinnedPostCacheController } from '../cache/PinnedPostCacheController';
import { ConversationPostCacheController } from '../cache/ConversationPostCacheController';
import { SequenceProcessorHandler } from 'sdk/framework/processor/SequenceProcessorHandler';
import PreFetchPostProcessor from '@/store/handler/cache/PreFetchPostProcessor';
import { notificationCenter } from 'sdk/service';
import { WINDOW } from 'sdk/service/eventKey';

jest.mock('sdk/framework/processor/SequenceProcessorHandler');
jest.mock('../cache/PinnedPostCacheController');
jest.mock('../cache/ConversationPostCacheController');
jest.mock('sdk/service/notificationCenter');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('PreFetchConversationDataHandler', () => {
  let pinnedPostCacheController: PinnedPostCacheController;
  let conversationPostCacheController: ConversationPostCacheController;
  let preFetchConversationDataHandler: PreFetchConversationDataHandler;
  let sequenceProcessorHandler: SequenceProcessorHandler;
  function setUp() {
    sequenceProcessorHandler = new SequenceProcessorHandler(
      'SequenceProcessorHandler',
    );
    pinnedPostCacheController = new PinnedPostCacheController();
    conversationPostCacheController = new ConversationPostCacheController();
    preFetchConversationDataHandler = new PreFetchConversationDataHandler([
      pinnedPostCacheController,
      conversationPostCacheController,
    ]);

    Object.assign(preFetchConversationDataHandler, {
      _preFetchQueueHandler: sequenceProcessorHandler,
    });
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('constructor', () => {
    beforeEach(() => {
      clearMocks();
    });

    it('should subscribe network change when construct', () => {
      notificationCenter.on.mockClear();
      preFetchConversationDataHandler = new PreFetchConversationDataHandler([
        pinnedPostCacheController,
        conversationPostCacheController,
      ]);

      expect(notificationCenter.on).toBeCalledWith(
        WINDOW.ONLINE,
        expect.anything(),
      );
    });
  });

  describe('addProcessor', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should add processor to sequence queue', async (done: any) => {
      sequenceProcessorHandler.addProcessor = jest
        .fn()
        .mockImplementation(async (processor: PreFetchPostProcessor) => {
          await processor.process();
        });

      const groupId = 1;
      preFetchConversationDataHandler.addProcessor(groupId);
      expect(sequenceProcessorHandler.addProcessor).toBeCalled();
      setTimeout(() => {
        expect(pinnedPostCacheController.doPreFetch).toBeCalledWith(groupId);
        expect(conversationPostCacheController.doPreFetch).toBeCalledWith(
          groupId,
        );
        done();
      },         10);
    });
  });

  describe('onNetWorkChanged', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      sequenceProcessorHandler.addProcessor = jest.fn();
    });

    it('should do nothing when network change to offline', () => {
      // prettier-ignore
      const networkChangeFn = preFetchConversationDataHandler['_onNetWorkChanged'].bind(preFetchConversationDataHandler);

      networkChangeFn(false);

      expect(sequenceProcessorHandler.addProcessor).not.toBeCalled();
    });

    it('should do pre fetch for un cached groups when network changed to online', () => {
      // prettier-ignore
      const networkChangeFn = preFetchConversationDataHandler['_onNetWorkChanged'].bind(preFetchConversationDataHandler);

      pinnedPostCacheController.getUnCachedGroupIds = jest
        .fn()
        .mockReturnValue([1, 2]);
      conversationPostCacheController.getUnCachedGroupIds = jest
        .fn()
        .mockReturnValue([2, 3]);

      networkChangeFn(true);

      expect(sequenceProcessorHandler.addProcessor).toBeCalledTimes(4);
      expect(sequenceProcessorHandler.addProcessor).nthCalledWith(
        1,
        (1, expect.any(PreFetchPostProcessor)),
      );
      expect(sequenceProcessorHandler.addProcessor).nthCalledWith(
        2,
        (2, expect.any(PreFetchPostProcessor)),
      );
      expect(sequenceProcessorHandler.addProcessor).nthCalledWith(
        3,
        (2, expect.any(PreFetchPostProcessor)),
      );
      expect(sequenceProcessorHandler.addProcessor).nthCalledWith(
        4,
        (3, expect.any(PreFetchPostProcessor)),
      );
    });

    it('should not do pre fetch for un cached groups when network changed to offline', () => {});
  });

  describe('onLogout', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });
  });

  describe('registerPreFetchControllers', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should add new cache controller', () => {
      const obj = { id: 2 };
      preFetchConversationDataHandler['_preFetchControllers'] = [];
      preFetchConversationDataHandler.registerPreFetchControllers([obj] as any);
      expect(preFetchConversationDataHandler['_preFetchControllers'][0]).toBe(
        obj,
      );
    });
  });

  describe('setCurrentConversation', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should call releaseCurrentConversation in all cache controller', () => {
      preFetchConversationDataHandler.setCurrentConversation(1);
      expect(
        pinnedPostCacheController.setCurrentCacheConversation,
      ).toBeCalledWith(1);
      expect(
        conversationPostCacheController.setCurrentCacheConversation,
      ).toBeCalledWith(1);
    });
  });

  describe('releaseCurrentConversation', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should call releaseCurrentConversation in all cache controller', () => {
      preFetchConversationDataHandler.releaseCurrentConversation(1);
      expect(
        pinnedPostCacheController.releaseCurrentConversation,
      ).toBeCalledWith(1);
      expect(
        conversationPostCacheController.releaseCurrentConversation,
      ).toBeCalledWith(1);
    });
  });

  describe('removeCache', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('remove cache in all cache controller', () => {
      preFetchConversationDataHandler.removeCache(1);
      expect(pinnedPostCacheController.remove).toBeCalledWith(1);
      expect(conversationPostCacheController.remove).toBeCalledWith(1);
    });
  });
});
