/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-01 15:14:12
 * Copyright © RingCentral. All rights reserved.
 */
import { IPreFetchController } from './cache/interface/IPreFetchController';
import { WINDOW } from 'sdk/service/eventKey';
import notificationCenter from 'sdk/service/notificationCenter';
import { SequenceProcessorHandler } from 'sdk/framework/processor';
import PreFetchPostProcessor from '@/store/handler/cache/PreFetchPostProcessor';
import pinnedPostCacheController from './cache/PinnedPostCacheController';
import conversationPostCacheController from './cache/ConversationPostCacheController';
import bookmarkCacheController from './cache/BookmarkCacheController';
import atMentionCacheController from './cache/AtMentionCacheController';
import { AT_MENTION_ID, BOOKMARK_ID } from './constant';
import { Profile } from 'sdk/module/profile/entity';
import ProfileModel from '../models/Profile';
import { getSingleEntity } from '../utils';
import { ENTITY_NAME } from '..';
import { autorun } from 'mobx';
import { MyState } from 'sdk/module/state';
import MyStateModel from '../models/MyState';
import { mainLogger } from 'foundation/log';

const LOG_TAG = '[PreFetchConversationDataHandler]';
class PreFetchConversationDataHandler {
  private static _instance: PreFetchConversationDataHandler;
  private _cachedGroupIds: Set<number>;
  private _preFetchControllers: IPreFetchController[] = [];
  private _preFetchQueueHandler: SequenceProcessorHandler;

  constructor(preFetchControllers: IPreFetchController[]) {
    this._cachedGroupIds = new Set();
    this._preFetchControllers = preFetchControllers;
    this._preFetchQueueHandler = new SequenceProcessorHandler({
      name: 'PreFetchConversationDataHandler',
    });
    this._subscribeNotification();
    notificationCenter.on(WINDOW.ONLINE, ({ onLine }) => {
      this._onNetWorkChanged(onLine);
    });
  }

  static getInstance() {
    if (!this._instance) {
      this._instance = new PreFetchConversationDataHandler([
        conversationPostCacheController,
        pinnedPostCacheController,
        bookmarkCacheController,
        atMentionCacheController,
      ]);
    }
    return this._instance;
  }

  private _subscribeNotification() {
    autorun(reaction => {
      const favoritePostIds = getSingleEntity<Profile, ProfileModel>(
        ENTITY_NAME.PROFILE,
        'favoritePostIds',
      );
      if (favoritePostIds) {
        this.addProcessor(BOOKMARK_ID);
        reaction.dispose();
        mainLogger
          .tags(LOG_TAG)
          .info(
            '_subscribeNotification() prefetch bookmark then dispose autorun',
          );
      }
    });

    autorun(reaction => {
      const atMentionPostIds = getSingleEntity<MyState, MyStateModel>(
        ENTITY_NAME.MY_STATE,
        'atMentionPostIds',
      );
      if (atMentionPostIds) {
        this.addProcessor(AT_MENTION_ID);
        reaction.dispose();
        mainLogger
          .tags(LOG_TAG)
          .info(
            '_subscribeNotification() prefetch atMention then dispose autorun',
          );
      }
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
    this._preFetchQueueHandler.removeProcessorByName(`${groupId}`);
    this._preFetchControllers.forEach(controller => controller.remove(groupId));
  }

  isGroupCachedBefore(groupId: number) {
    return this._cachedGroupIds.has(groupId);
  }
}

export { PreFetchConversationDataHandler };
