/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-27 16:06:49
 * Copyright © RingCentral. All rights reserved.
 */
import history from '@/history';
import { service } from 'sdk';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';

const _getConversationId = async (id: number) => {
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
  const conversationId = await _getConversationId(id);
  if (!conversationId) return false;

  history.push(`/messages/${conversationId}`);
  return true;
}

export { goToConversation };
