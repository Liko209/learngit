import history from '@/history';

export function jumpToPost(postId: number, groupId: number) {
  return history.push(`/messages/${groupId}`, { jumpToPostId: postId });
}
