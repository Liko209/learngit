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
import { getErrorType } from '@/common/catchError';

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
const ERROR_CONVERSATION_NOT_FOUND = 'ERROR_CONVERSATION_NOT_FOUND';
const DELAY_LOADING = 500;

function goToConversation({
  conversationId,
  jumpToPostId,
  replaceHistory,
}: BaseGoToConversationParams) {
  const args: [string, any?] = [String(conversationId)];
  const currentConversation = getGlobalValue(
    GLOBAL_KEYS.CURRENT_CONVERSATION_ID,
  );
  if (replaceHistory || conversationId === currentConversation) {
    args.push('REPLACE');
  } else {
    args.push('PUSH');
  }
  if (jumpToPostId) {
    args.push({ jumpToPostId });
  }
  MessageRouterChangeHelper.goToConversation(...args);
}

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
      throw error;
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
  }, DELAY_LOADING);

  let beforeJumpFun;
  if (beforeJump) {
    beforeJumpFun = beforeJump;
  } else {
    beforeJumpFun = window[goToConversationCallBackName];
  }

  try {
    const conversationId = await getConversationId(id);
    if (!conversationId) {
      throw new Error(ERROR_CONVERSATION_NOT_FOUND);
    }
    clearTimeout(timer);
    (beforeJump || hasBeforeJumpFun) && (await beforeJumpFun(conversationId));
    await goToConversation({
      conversationId,
      jumpToPostId,
      replaceHistory: needReplaceHistory,
    });
    window[goToConversationCallBackName] = null;
    return true;
  } catch (err) {
    if (beforeJump) {
      window[goToConversationCallBackName] = beforeJump;
      delete params.beforeJump;
      params.hasBeforeJumpFun = true;
    }
    history.replace('/messages/loading', {
      params: err.message === ERROR_CONVERSATION_NOT_FOUND ? undefined : params,
      error: true,
      errorType: getErrorType(err),
    });
    return false;
  }
}

export {
  goToConversationWithLoading,
  goToConversation,
  getConversationId,
  GoToConversationParams,
  DELAY_LOADING,
  ERROR_CONVERSATION_NOT_FOUND,
};
