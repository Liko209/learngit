import { Post } from 'sdk/module/post/entity';
import { BaseStore } from '../BaseStore';

export class PostStore extends BaseStore<Post> {
  constructor() {
    super('post');
  }

  getPostsByGroupId(groupId: number) {
    return this.collection.where(value => {
      return value.group_id === groupId;
    });
  }
}
