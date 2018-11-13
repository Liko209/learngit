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
  @observable
  atMentionNonItemIds?: number[];
  @observable
  itemIds: number[];
  @observable
  itemId?: number;
  @observable
  likes?: number[];
  groupId: number;
  @observable
  activityData?: any;
  constructor(data: Post) {
    super(data);
    this.createdAt = data.created_at;
    this.creatorId = data.creator_id;
    this.text = data.text;
    this.status = data.status;
    this.atMentionNonItemIds = data.at_mention_non_item_ids;
    this.itemIds = data.item_ids;
    this.likes = data.likes;
    this.groupId = data.group_id;
    this.activityData = data.activity_data;
  }

  static fromJS(data: Post) {
    return new PostModel(data);
  }
}
