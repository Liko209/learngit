import { goToConversation } from './goToConversation';

type JumpToPostParams = {
  id: number;
  groupId: number;
  replaceHistory?: boolean;
};

function jumpToPost({ id, groupId, replaceHistory }: JumpToPostParams) {
  return goToConversation({
    replaceHistory,
    conversationId: groupId,
    jumpToPostId: id,
  });
}

export { jumpToPost };
