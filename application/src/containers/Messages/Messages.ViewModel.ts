/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-08 18:38:53
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import _ from 'lodash';
import { AbstractViewModel } from '@/base';
import { getGlobalValue } from '@/store/utils';
import { StateService } from 'sdk/service';
import storeManager from '@/store';
import { History } from 'history';

class MessagesViewModel extends AbstractViewModel {
  @computed
  get currentConversationId() {
    return storeManager.getGlobalStore().get('currentConversationId');
  }

  constructor() {
    super();
    this.getLastGroupId = this.getLastGroupId.bind(this);
    this.toConversation = this.toConversation.bind(this);
  }

  async getLastGroupId(id?: number) {
    const stateService: StateService = StateService.getInstance();
    return stateService.getLastValidGroupId(id);
  }

  @computed
  get isLeftNavOpen() {
    return getGlobalValue('isLeftNavOpen');
  }

  toConversation(id: string, history: History) {
    const globalStore = storeManager.getGlobalStore();
    globalStore.set('currentConversationId', Number(id));
    history.push(`/messages/${id}`);
  }
}

export { MessagesViewModel };
