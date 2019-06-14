import { Post } from 'sdk/module/post/entity';
import { BaseStore } from '../BaseStore';

export class PostStore extends BaseStore<Post> {

  constructor() {
    super('post');
  }

}
