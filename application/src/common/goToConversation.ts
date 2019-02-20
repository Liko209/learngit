/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-27 16:06:49
 * Copyright © RingCentral. All rights reserved.
 */
import history from '@/history';
import { GroupService } from 'sdk/module/group';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';

type GoToConversationParams = {
  id: number | number[];
  message?: string;
  beforeJump?: (id: number) => {};
  hasBeforeJumpFun?: boolean;
};

const goToConversationCallBackName = Symbol('goToConversationCallBackName');
const DELAY_LOADING = 500;

const getConversationId = async (id: number | number[]) => {
  const groupService: GroupService = GroupService.getInstance();
  const type = Array.isArray(id)
    ? TypeDictionary.TYPE_ID_PERSON
    : GlipTypeUtil.extractTypeId(id);
  if (
    type === TypeDictionary.TYPE_ID_GROUP ||
    type === TypeDictionary.TYPE_ID_TEAM
  ) {
    return id as number;
  }
  if (type === TypeDictionary.TYPE_ID_PERSON) {
    const result = await groupService.getOrCreateGroupByMemberList(
      Array.isArray(id) ? id : [id],
    );
    if (result.isOk()) {
      return result.data.id;
    }
  }
  return null;
};

async function goToConversation(params: GoToConversationParams) {
  const { id, beforeJump, hasBeforeJumpFun } = params;
  const timer = setTimeout(() => {
    history.push('/messages/loading');
  },                       DELAY_LOADING);

  let beforeJumpFun;
  if (beforeJump) {
    beforeJumpFun = beforeJump;
  } else {
    beforeJumpFun = window[goToConversationCallBackName];
    window[goToConversationCallBackName] = null;
  }
  try {
    const conversationId = await getConversationId(id);
    if (!conversationId) {
      throw new Error('Conversation not found.');
    }
    clearTimeout(timer);
    (beforeJump || hasBeforeJumpFun) && (await beforeJumpFun(conversationId));
    history.replace(`/messages/${conversationId}`);
    return true;
  } catch (err) {
    if (beforeJump) {
      window[goToConversationCallBackName] = beforeJump;
      delete params.beforeJump;
      params.hasBeforeJumpFun = true;
    }
    history.replace('/messages/loading', {
      params,
      error: true,
    });
    return false;
  }
}

export {
  goToConversation,
  getConversationId,
  GoToConversationParams,
  DELAY_LOADING,
};
