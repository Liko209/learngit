import { TypeDictionary } from 'sdk/utils';
import PostModel from '@/store/models/Post';

export function isEditable(post: PostModel) {
  const { itemTypeIds, id } = post;
  return id > 0 && !(itemTypeIds && (!!itemTypeIds[TypeDictionary.TYPE_ID_TASK] || !!itemTypeIds[TypeDictionary.TYPE_ID_EVENT]));
}
