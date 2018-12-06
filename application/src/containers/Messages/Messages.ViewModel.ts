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
import { service } from 'sdk';

const { GroupService, ProfileService, StateService } = service;
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

  getLastGroupId = async (): Promise<number | undefined> => {
    let groupId;
    const stateService: service.StateService = StateService.getInstance();
    const myState = await stateService.getMyState();
    if (!myState) {
      return;
    }
    groupId = myState.last_group_id;
    if (!groupId) {
      return;
    }
    try {
      const groupService: service.GroupService = GroupService.getInstance();
      const lastGroup = await groupService.getGroupById(groupId);
      if (lastGroup && lastGroup.is_archived) {
        return;
      }
      const profileService: service.ProfileService = ProfileService.getInstance();
      const isHidden = await profileService.isConversationHidden(groupId);
      if (isHidden) {
        return;
      }
      return groupId;
    } catch (e) {
      console.warn(`Find Group info failed ${groupId}`);
      return;
    }
  }

  @computed
  get isLeftNavOpen() {
    return getGlobalValue(GLOBAL_KEYS.IS_LEFT_NAV_OPEN);
  }

  @computed
  get loadingMessage() {
    return getGlobalValue(GLOBAL_KEYS.MESSAGE_LOADING).isLoading;
  }

  @computed
  get tryConversationId() {
    return getGlobalValue(GLOBAL_KEYS.MESSAGE_LOADING).conversationId;
  }
}

export { MessagesViewModel };
