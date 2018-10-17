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
import { MessagesProps } from './types';

class MessagesViewModel extends AbstractViewModel<MessagesProps> {
  @computed
  get currentConversationId() {
    return storeManager.getGlobalStore().get('currentConversationId');
  }

  updateCurrentConversationId = (currentConversationId?: number) => {
    storeManager
      .getGlobalStore()
      .set('currentConversationId', currentConversationId);
  }

  getLastGroupId = async (id?: number) => {
    const stateService: StateService = StateService.getInstance();
    return stateService.getLastValidGroupId(id);
  }

  @computed
  get isLeftNavOpen() {
    return getGlobalValue('isLeftNavOpen');
  }
}

export { MessagesViewModel };
