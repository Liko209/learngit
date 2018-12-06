/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-27 16:06:49
 * Copyright © RingCentral. All rights reserved.
 */
import history from '@/history';
import { service } from 'sdk';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';

const DELAY_LOADING = 300;

const globalStore = storeManager.getGlobalStore();

const getConversationId = async (id: number) => {
  const { GroupService } = service;
  const groupService: service.GroupService = GroupService.getInstance();
  const type = GlipTypeUtil.extractTypeId(id);
  if (
    type === TypeDictionary.TYPE_ID_GROUP ||
    type === TypeDictionary.TYPE_ID_TEAM
  ) {
    return id;
  }
  if (type === TypeDictionary.TYPE_ID_PERSON) {
    try {
      const group = await groupService.getOrCreateGroupByMemberList([id]);
      if (group) {
        return group.id;
      }
      return null;
    } catch (e) {
      return null;
    }
  }
  return null;
};

async function goToConversation(id: number) {
  const timer = setTimeout(() => {
    globalStore.set(GLOBAL_KEYS.MESSAGE_LOADING, {
      isLoading: true,
      conversationId: id, // need set prev id in order to try again
    });
  },                       DELAY_LOADING);
  const conversationId = await getConversationId(id);
  clearTimeout(timer);
  if (!conversationId) return false;

  globalStore.set(GLOBAL_KEYS.MESSAGE_LOADING, {
    conversationId,
    isLoading: false,
  });
  history.push(`/messages/${conversationId}`);
  return true;
}

export { goToConversation, getConversationId };
