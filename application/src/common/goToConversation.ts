/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-27 16:06:49
 * Copyright © RingCentral. All rights reserved.
 */
import history from '@/history';
import { service } from 'sdk';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';

type GoToConversationParams = {
  id?: number;
  memberIds?: number[];
  message?: string;
};

const getConversationId = async ({
  id,
  memberIds,
  message,
}: GoToConversationParams) => {
  let groupId = null;
  const { GroupService, PostService } = service;
  const groupService: service.GroupService = GroupService.getInstance();
  if (id) {
    const type = GlipTypeUtil.extractTypeId(id);
    if (
      type === TypeDictionary.TYPE_ID_GROUP ||
      type === TypeDictionary.TYPE_ID_TEAM
    ) {
      groupId = id;
    }
    if (type === TypeDictionary.TYPE_ID_PERSON) {
      const result = await groupService.getOrCreateGroupByMemberList([id]);
      if (result.isOk()) {
        groupId = result.data.id;
      }
    }
  }
  if (memberIds) {
    const result = await groupService.getOrCreateGroupByMemberList(memberIds);
    if (result.isOk()) {
      groupId = result.data.id;
    }
  }
  if (message && groupId) {
    const postService: service.PostService = PostService.getInstance();
    try {
      await postService.sendPost({ groupId, text: message });
    } catch (err) {
      groupId = null;
    }
  }
  return groupId;
};

async function goToConversation(params: GoToConversationParams) {
  const { id, memberIds, message } = params;
  history.push('/messages/loading');
  const conversationId = await getConversationId({ id, memberIds, message });
  if (!conversationId) {
    history.replace('/messages/loading', {
      params,
      error: true,
    });
    return false;
  }
  history.replace(`/messages/${conversationId}`);
  return true;
}

export { goToConversation, getConversationId, GoToConversationParams };
