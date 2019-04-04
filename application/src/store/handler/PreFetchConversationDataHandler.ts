/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-01 15:14:12
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { IPreFetchController } from './cache/interface/IPreFetchController';
import { WINDOW } from 'sdk/service/eventKey';
import notificationCenter from 'sdk/service/notificationCenter';
import { SequenceProcessorHandler } from 'sdk/framework/processor/SequenceProcessorHandler';
import PreFetchPostProcessor from '@/store/handler/cache/PreFetchPostProcessor';
import pinnedPostCacheController from './cache/PinnedPostCacheController';
import conversationPostCacheController from './cache/ConversationPostCacheController';
class PreFetchConversationDataHandler {
  private _cachedGroupIds: Set<number>;
  private _preFetchControllers: IPreFetchController[] = [];
  private _preFetchQueueHandler: SequenceProcessorHandler;

  constructor(preFetchControllers: IPreFetchController[]) {
    this._cachedGroupIds = new Set();
    this._preFetchControllers = preFetchControllers;
    this._preFetchQueueHandler = new SequenceProcessorHandler(
      'PreFetchConversationDataHandler',
    );

    notificationCenter.on(WINDOW.ONLINE, ({ onLine }) => {
      this._onNetWorkChanged(onLine);
    });
  }

  addProcessor(groupId: number) {
    this._cachedGroupIds.add(groupId);
    this._addProcessor(groupId);
  }

  private _onNetWorkChanged(onLine: boolean) {
    if (onLine) {
      this._preFetchControllers.map(controller =>
        this._preFetchUnCachedGroupData(controller),
      );
    }
  }

  private _preFetchUnCachedGroupData(controller: IPreFetchController) {
    const groupIds = controller.getUnCachedGroupIds();
    for (const groupId of groupIds) {
      const processor = new PreFetchPostProcessor(
        groupId,
        async (groupId: number) => {
          await controller.doPreFetch(groupId);
        },
        `${groupId}_${controller.name()}`,
      );

      this._preFetchQueueHandler.addProcessor(processor);
    }
  }

  registerPreFetchControllers(preFetchControllers: IPreFetchController[]) {
    this._preFetchControllers.push(...preFetchControllers);
  }

  private _addProcessor(groupId: number) {
    const processor = new PreFetchPostProcessor(
      groupId,
      async (groupId: number) => {
        await this._doPreFetchAll(groupId);
      },
    );

    this._preFetchQueueHandler.addProcessor(processor);
  }

  private async _doPreFetchAll(groupId: number) {
    const promises: Promise<void>[] = [];
    for (const controller of this._preFetchControllers) {
      promises.push(controller.doPreFetch(groupId));
    }

    promises.length && (await Promise.all(promises));
  }

  setCurrentConversation(groupId: number) {
    this._preFetchControllers.forEach(controller =>
      controller.setCurrentCacheConversation(groupId),
    );
  }

  releaseCurrentConversation(groupId: number) {
    this._preFetchControllers.forEach(controller =>
      controller.releaseCurrentConversation(groupId),
    );
  }

  removeCache(groupId: number) {
    this._cachedGroupIds.delete(groupId);
    this._preFetchControllers.forEach(controller => controller.remove(groupId));
  }

  isGroupCachedBefore(groupId: number) {
    return this._cachedGroupIds.has(groupId);
  }
}

const preFetchConversationDataHandler = new PreFetchConversationDataHandler([
  conversationPostCacheController,
  pinnedPostCacheController,
]);

export default preFetchConversationDataHandler;
export { PreFetchConversationDataHandler };
