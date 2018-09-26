import { POST_STATUS } from 'sdk/service';
import { Post } from 'sdk/models';
import Base from './Base';
import { observable } from 'mobx';
export default class PostModel extends Base<Post> {
  createdAt: number;
  @observable
  text: string;
  @observable
  creatorId: number;
  @observable
  status?: POST_STATUS;
  constructor(data: Post) {
    super(data);
    this.createdAt = data.created_at;
    this.creatorId = data.creator_id;
    this.text = data.text;
    this.status = data.status;
  }

  static fromJS(data: Post) {
    return new PostModel(data);
  }
}
