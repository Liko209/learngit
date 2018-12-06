/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-08 18:38:53
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import _ from 'lodash';
import { AbstractViewModel } from '@/base';
import { getGlobalValue } from '@/store/utils';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { MessagesProps } from './types';

class MessagesViewModel extends AbstractViewModel<MessagesProps> {
  @computed
  get currentConversationId() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);
  }

  updateCurrentConversationId = (
    currentConversationId: number | string = 0,
  ) => {
    let id = currentConversationId;
    if (
      typeof currentConversationId === 'string' &&
      !/\d+/.test(currentConversationId)
    ) {
      id = 0;
    }
    storeManager
      .getGlobalStore()
      .set(GLOBAL_KEYS.CURRENT_CONVERSATION_ID, Number(id));
  }

  @computed
  get isLeftNavOpen() {
    return getGlobalValue(GLOBAL_KEYS.IS_LEFT_NAV_OPEN);
  }
}

export { MessagesViewModel };
