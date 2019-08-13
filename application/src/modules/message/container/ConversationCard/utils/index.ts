import { TypeDictionary } from 'sdk/utils';
import PostModel from '@/store/models/Post';
import { RepliedEntityHandlers } from '../types';
import { TEAM_MENTION_ID } from '../../ConversationPage/MessageInput/Mention/constants';

export function isEditable(post: PostModel) {
  const { itemTypeIds, id } = post;
  return (
    id > 0 &&
    !(
      itemTypeIds &&
      (!!itemTypeIds[TypeDictionary.TYPE_ID_TASK] ||
        !!itemTypeIds[TypeDictionary.TYPE_ID_EVENT])
    )
  );
}

export function isMentionIdsContainTeam(ids: number[]) {
  return (
    ids &&
    ids.some(id => {
      return id === TEAM_MENTION_ID;
    })
  );
}

export const repliedEntityHandlers: RepliedEntityHandlers = {
  [TypeDictionary.TYPE_ID_TASK]: ({ text, complete }) => ({
    title: text,
    iconName: complete ? 'tasks' : 'task_incomplete',
  }),
  [TypeDictionary.TYPE_ID_EVENT]: ({ text }) => ({
    title: text,
    iconName: 'event',
  }),
  [TypeDictionary.TYPE_ID_CODE]: ({ title }) => ({
    title,
    iconName: 'code',
  }),
  [TypeDictionary.TYPE_ID_LINK]: ({ title, url }) => ({
    title: title || url,
    iconName: 'link',
  }),
  [TypeDictionary.TYPE_ID_FILE]: ({ name }) => ({
    title: name,
    iconName: 'attachment',
  }),
  [TypeDictionary.TYPE_ID_PAGE]: ({ title }) => ({
    title,
    iconName: 'notes',
  }),
};
