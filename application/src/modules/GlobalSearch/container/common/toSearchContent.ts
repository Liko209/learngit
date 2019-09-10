/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-10 19:46:36
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { GlobalSearchStore } from '../../store';
import { SEARCH_SCOPE, SEARCH_VIEW, TAB_TYPE } from '../../types';

function toSearchContent(isInThisConversation: boolean, groupId?: number) {
  const store = container.get(GlobalSearchStore);
  if (isInThisConversation) {
    const conversationId = getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);
    store.setSearchScope(SEARCH_SCOPE.CONVERSATION);
    store.setGroupId(groupId || conversationId);
  } else {
    store.setSearchScope(SEARCH_SCOPE.GLOBAL);
  }
  store.setCurrentView(SEARCH_VIEW.FULL_SEARCH);
  store.setCurrentTab(TAB_TYPE.CONTENT);
}

export { toSearchContent };
