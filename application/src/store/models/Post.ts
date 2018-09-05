import { IEntity } from './../store.d';
import { Post } from 'sdk/models';
import { observable } from 'mobx';
export default class PostModel implements IEntity {
  id: number;
  @observable createdAt: number;
  @observable text: string;
  constructor(data: Post) {
    this.id = data.id;
    this.createdAt = data.created_at;
    this.text = data.text;
  }

  static fromJS(data: Post) {
    return new PostModel(data);
  }

  dispose() { }
}
