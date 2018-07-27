/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-04-02 13:53:43
 * Copyright © RingCentral. All rights reserved.
 */
import storeManager, { ENTITY_NAME } from '@/store';
import BasePresenter from '@/store/base/BasePresenter';

import { service } from 'sdk';

const { StateService } = service;

export default class ConversationTabPresenter extends BasePresenter {
  constructor() {
    super();
    this.stateService = StateService.getInstance();
    this.groupStateStore = storeManager.getEntityMapStore(
      ENTITY_NAME.GROUP_STATE
    );
  }

  markAsRead(conversationId) {
    this.groupStateStore.batchSet([
      {
        unread_count: 0,
        unread_mentions_count: 0,
        id: conversationId
      }
    ]);
    // this.stateService.markAsRead(conversationId);
  }

  // updateLastGroup(conversationId) {
  //   this.stateService.updateLastGroup(conversationId);
  // }
}
