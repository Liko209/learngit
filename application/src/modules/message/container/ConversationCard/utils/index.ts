import { TypeDictionary } from 'sdk/utils';
import PostModel from '@/store/models/Post';

export function isEditable(post: PostModel) {
  const { itemTypeIds } = post;
  return !(
    itemTypeIds &&
    (!!itemTypeIds[TypeDictionary.TYPE_ID_TASK] ||
      !!itemTypeIds[TypeDictionary.TYPE_ID_EVENT])
  );
}
