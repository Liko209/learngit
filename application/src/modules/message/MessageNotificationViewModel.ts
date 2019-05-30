import { AbstractViewModel } from '@/base/AbstractViewModel';
import { getEntity } from '@/store/utils';
import PostModel from '@/store/models/Post';
import { Post } from 'sdk/module/post/entity/Post';
import { ENTITY_NAME } from '@/store';
type Hooks = {
  onCreate: Function;
  onUpdate?: Function;
  onDispose: Function;
};

class MessageNotificationViewModel extends AbstractViewModel {
  constructor(id: number, { onCreate, onUpdate, onDispose }: Hooks) {
    super();
    onCreate(id);
    if (onUpdate) {
      this.reaction(
        () => getEntity<Post, PostModel>(ENTITY_NAME.POST, id).text,
        () => {
          onUpdate(id);
        },
      );
    }
    this.when(
      () => !!getEntity<Post, PostModel>(ENTITY_NAME.POST, id).deactivated,
      onDispose,
    );
  }
}
export { MessageNotificationViewModel };
