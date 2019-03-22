import { goToConversation } from './goToConversation';

type JumpToPostParams = {
  id: number;
  groupId: number;
};

function jumpToPost({ id, groupId }: JumpToPostParams) {
  return goToConversation({
    conversationId: groupId,
    jumpToPostId: id,
  });
}

export { jumpToPost };
