/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-27 16:06:49
 * Copyright © RingCentral. All rights reserved.
 */
import history from '@/history';
import { service } from 'sdk';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import { Notification } from '@/containers/Notification';
import { errorHelper } from 'sdk/error';

type GoToConversationParams = {
  id: number | number[];
  message?: string;
  joinTeamFun?: (id: number) => {};
};

const getConversationId = async (id: number | number[]) => {
  const { GroupService } = service;
  const groupService: service.GroupService = GroupService.getInstance();
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
  const { id, message, joinTeamFun } = params;
  const { PostService } = service;
  history.push('/messages/loading');
  try {
    const conversationId = await getConversationId(id);
    if (!conversationId) {
      throw new Error('Conversation not found.');
    }
    if (message && conversationId) {
      const postService: service.PostService = PostService.getInstance();
      await postService.sendPost({ groupId: conversationId, text: message });
    }
    if (joinTeamFun && conversationId) {
      try {
        await joinTeamFun(conversationId);
      } catch (error) {
        if (errorHelper.isNotAuthorizedError(error)) {
          Notification.flashToast({
            message: 'JoinTeamAuthorizedError',
            type: 'error',
            messageAlign: 'left',
            fullWidth: false,
            dismissible: false,
          });
        }
      }
    }
    history.replace(`/messages/${conversationId}`);
    return true;
  } catch (err) {
    history.replace('/messages/loading', {
      params,
      error: true,
      errObj: err,
    });
    return false;
  }
}

// async function goToConversation(params: GoToConversationParams) {
//   const { id, message } = params;
//   const { PostService } = service;
//   history.push('/messages/loading');
//   try {
//     const conversationId = await getConversationId(id);
//     if (!conversationId) {
//       throw new Error('Conversation not found.');
//     }
//     if (message && conversationId) {
//       const postService: service.PostService = PostService.getInstance();
//       await postService.sendPost({ groupId: conversationId, text: message });
//     }
//     history.replace(`/messages/${conversationId}`);
//     return true;
//   } catch (err) {
//     history.replace('/messages/loading', {
//       params,
//       error: true,
//     });
//     return false;
//   }
// }

export { goToConversation, getConversationId, GoToConversationParams };
