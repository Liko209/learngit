import { IEntity } from './../store.d';
import { Post } from 'sdk/models';
export default class PostModel implements IEntity {
  id: number;
  constructor(data: Post) {
    this.id = data.id;
  }

  static fromJS(data: Post) {
    return new PostModel(data);
  }

  dispose() { }
}
