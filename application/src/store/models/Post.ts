import { Post } from 'sdk/models';
import Base from './Base';
export default class PostModel extends Base<Post> {
  constructor(data: Post) {
    super(data);
  }

  static fromJS(data: Post) {
    return new PostModel(data);
  }
}
