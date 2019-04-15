/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-27 16:06:49
 * Copyright © RingCentral. All rights reserved.
 */
import history from '@/history';
import { GroupService } from 'sdk/module/group';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { MessageRouterChangeHelper } from '../modules/message/container/Message/helper';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';

type BaseGoToConversationParams = {
  conversationId: number;
  jumpToPostId?: number;
  replaceHistory?: boolean;
};

type GoToConversationParams = {
  id: number | number[];
  jumpToPostId?: number;
  message?: string;
  beforeJump?: (id: number) => {};
  hasBeforeJumpFun?: boolean;
};

const goToConversationCallBackName = Symbol('goToConversationCallBackName');
const DELAY_LOADING = 500;

const getConversationId = async (id: number | number[]) => {
  const groupService = ServiceLoader.getInstance<GroupService>(
    ServiceConfig.GROUP_SERVICE,
  );
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
    try {
      const result = await groupService.getOrCreateGroupByMemberList(
        Array.isArray(id) ? id : [id],
      );
      return result.id;
    } catch (error) {
      return null;
    }
  }
  return null;
};

async function goToConversationWithLoading(params: GoToConversationParams) {
  const { id, jumpToPostId, beforeJump, hasBeforeJumpFun } = params;
  let needReplaceHistory = false;

  const timer = setTimeout(() => {
    needReplaceHistory = true;
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
    await goToConversation({
      conversationId,
      jumpToPostId,
      replaceHistory: needReplaceHistory,
    });
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

function goToConversation({
  conversationId,
  jumpToPostId,
  replaceHistory,
}: BaseGoToConversationParams) {
  const args: [string, any?] = [String(conversationId)];
  const currentConversation = getGlobalValue(
    GLOBAL_KEYS.CURRENT_CONVERSATION_ID,
  );
  if (replaceHistory === undefined) {
    if (conversationId === currentConversation) {
      args.push('REPLACE');
    } else {
      args.push('PUSH');
    }
  } else if (replaceHistory) {
    args.push('REPLACE');
  } else {
    args.push('PUSH');
  }
  if (jumpToPostId) {
    args.push({ jumpToPostId });
  }
  MessageRouterChangeHelper.goToConversation(...args);
}

export {
  goToConversationWithLoading,
  goToConversation,
  getConversationId,
  GoToConversationParams,
  DELAY_LOADING,
};
