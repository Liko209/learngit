/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-02 21:20:21
 * Copyright © RingCentral. All rights reserved.
 */

import { PreFetchConversationDataHandler } from '../PreFetchConversationDataHandler';
import { PinnedPostCacheController } from '../cache/PinnedPostCacheController';
import { ConversationPostCacheController } from '../cache/ConversationPostCacheController';
import {
  SequenceProcessorHandler,
  SingletonSequenceProcessor,
} from 'sdk/framework/processor';
import PreFetchPostProcessor from '@/store/handler/cache/PreFetchPostProcessor';
import { notificationCenter } from 'sdk/service';
import { WINDOW } from 'sdk/service/eventKey';
import { BOOKMARK_ID, AT_MENTION_ID } from '../constant';
import { BookmarkCacheController } from '../cache/BookmarkCacheController';
import { AtMentionCacheController } from '../cache/AtMentionCacheController';
import { getSingleEntity } from '@/store/utils';

jest.mock('sdk/framework/processor/SequenceProcessorHandler');
jest.mock('../cache/PinnedPostCacheController');
jest.mock('../cache/BookmarkCacheController');
jest.mock('../cache/AtMentionCacheController');
jest.mock('../cache/ConversationPostCacheController');
jest.mock('sdk/service/notificationCenter');
jest.mock('@/store/utils');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('PreFetchConversationDataHandler', () => {
  let pinnedPostCacheController: PinnedPostCacheController;
  let bookmarkCacheController: BookmarkCacheController;
  let atMentionCacheController: AtMentionCacheController;
  let conversationPostCacheController: ConversationPostCacheController;
  let preFetchConversationDataHandler: PreFetchConversationDataHandler;
  let sequenceProcessorHandler: SequenceProcessorHandler;
  function setUp() {
    sequenceProcessorHandler = SingletonSequenceProcessor.getSequenceProcessorHandler(
      { name: 'SequenceProcessorHandler' },
    );
    pinnedPostCacheController = new PinnedPostCacheController();
    conversationPostCacheController = new ConversationPostCacheController();
    bookmarkCacheController = new BookmarkCacheController();
    atMentionCacheController = new AtMentionCacheController();
    preFetchConversationDataHandler = new PreFetchConversationDataHandler([
      pinnedPostCacheController,
      conversationPostCacheController,
      bookmarkCacheController,
      atMentionCacheController,
    ]);
    (getSingleEntity as jest.Mock).mockReturnValue([6, 8, 10]);
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

      expect(notificationCenter.on).toHaveBeenCalledWith(
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
      expect(sequenceProcessorHandler.addProcessor).toHaveBeenCalled();
      setTimeout(() => {
        expect(pinnedPostCacheController.doPreFetch).toHaveBeenCalledWith(
          groupId,
        );
        expect(conversationPostCacheController.doPreFetch).toHaveBeenCalledWith(
          groupId,
        );
        done();
      }, 10);
    });
  });

  describe('preFetchAtMention', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should add processor to sequence queue', done => {
      sequenceProcessorHandler.addProcessor = jest
        .fn()
        .mockImplementation(async (processor: PreFetchPostProcessor) => {
          await processor.process();
        });

      preFetchConversationDataHandler.addProcessor(AT_MENTION_ID);
      expect(sequenceProcessorHandler.addProcessor).toHaveBeenCalled();
      setTimeout(() => {
        expect(atMentionCacheController.doPreFetch).toHaveBeenCalledWith(
          AT_MENTION_ID,
        );
        done();
      }, 10);
    });
  });

  describe('preFetchBookmark', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should add processor to sequence queue', done => {
      sequenceProcessorHandler.addProcessor = jest
        .fn()
        .mockImplementation(async (processor: PreFetchPostProcessor) => {
          await processor.process();
        });

      preFetchConversationDataHandler.addProcessor(BOOKMARK_ID);
      expect(sequenceProcessorHandler.addProcessor).toHaveBeenCalled();
      setTimeout(() => {
        expect(bookmarkCacheController.doPreFetch).toHaveBeenCalledWith(
          BOOKMARK_ID,
        );
        done();
      }, 10);
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

      expect(sequenceProcessorHandler.addProcessor).not.toHaveBeenCalled();
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
      atMentionCacheController.getUnCachedGroupIds = jest
        .fn()
        .mockReturnValue([AT_MENTION_ID]);
      bookmarkCacheController.getUnCachedGroupIds = jest
        .fn()
        .mockReturnValue([BOOKMARK_ID]);

      networkChangeFn(true);

      expect(sequenceProcessorHandler.addProcessor).toHaveBeenCalledTimes(6);
      expect(sequenceProcessorHandler.addProcessor).toHaveBeenNthCalledWith(
        1,
        (1, expect.any(PreFetchPostProcessor)),
      );
      expect(sequenceProcessorHandler.addProcessor).toHaveBeenNthCalledWith(
        2,
        (2, expect.any(PreFetchPostProcessor)),
      );
      expect(sequenceProcessorHandler.addProcessor).toHaveBeenNthCalledWith(
        3,
        (3, expect.any(PreFetchPostProcessor)),
      );
      expect(sequenceProcessorHandler.addProcessor).toHaveBeenNthCalledWith(
        4,
        (4, expect.any(PreFetchPostProcessor)),
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
      ).toHaveBeenCalledWith(1);
      expect(
        conversationPostCacheController.setCurrentCacheConversation,
      ).toHaveBeenCalledWith(1);
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
      ).toHaveBeenCalledWith(1);
      expect(
        conversationPostCacheController.releaseCurrentConversation,
      ).toHaveBeenCalledWith(1);
    });
  });

  describe('removeCache', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('remove cache in all cache controller', () => {
      preFetchConversationDataHandler.removeCache(1);
      expect(pinnedPostCacheController.remove).toHaveBeenCalledWith(1);
      expect(conversationPostCacheController.remove).toHaveBeenCalledWith(1);
    });
  });
});
