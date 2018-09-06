import { Post } from 'sdk/models';
import Base from './Base';
import { observable } from 'mobx';
export default class PostModel extends Base<Post> {
  @observable createdAt: number;
  @observable text: string;
  constructor(data: Post) {
    super(data);
    this.createdAt = data.created_at;
    this.text = data.text;
  }

  static fromJS(data: Post) {
    return new PostModel(data);
  }
}
