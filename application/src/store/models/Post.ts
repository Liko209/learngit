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
  activityData?: { [index: string]: any };
  itemId?: number;
  @observable
  likes?: number[];
  @observable
  groupId: number;
  @observable
  itemData?: object;
  @observable
  source?: string;
  @observable
  parentId?: number;

  constructor(data: Post) {
    super(data);
    const {
      created_at,
      creator_id,
      text,
      status,
      at_mention_non_item_ids,
      item_ids,
      likes,
      activity_data,
      item_id,
      group_id,
      item_data,
      source,
      parent_id,
    } = data;
    this.createdAt = created_at;
    this.creatorId = creator_id;
    this.activityData = activity_data;
    this.text = text;
    this.itemId = item_id;
    this.status = status;
    this.atMentionNonItemIds = at_mention_non_item_ids;
    this.itemIds = item_ids;
    this.likes = likes;
    this.groupId = group_id;
    this.itemData = item_data;
    this.source = source;
    this.parentId = parent_id;
  }

  static fromJS(data: Post) {
    return new PostModel(data);
  }
}
