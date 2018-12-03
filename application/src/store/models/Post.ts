import { POST_STATUS } from 'sdk/service';
import { Post } from 'sdk/models';
import { GlipTypeUtil } from 'sdk/utils';
import Base from './Base';
import { observable, computed } from 'mobx';
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
  activityData?: { [index: string]: any };
  @observable
  activity?: string;
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
      activity,
      item_id,
      group_id,
      item_data,
      source,
      parent_id,
    } = data;
    this.createdAt = created_at;
    this.creatorId = creator_id;
    this.activityData = activity_data;
    this.activity = activity;
    this.text = text;
    this.status = status;
    this.atMentionNonItemIds = at_mention_non_item_ids;
    this.itemId = item_id;
    this.itemIds = item_ids;
    this.likes = likes;
    this.groupId = group_id;
    this.itemData = item_data;
    this.source = source;
    this.parentId = parent_id;
  }

  @computed
  get existItemIds() {
    return this.itemId ? [this.itemId] : this.itemIds;
  }

  @computed
  get itemTypeIds() {
    const itemTypeIds = {};
    this.existItemIds.forEach((id: number) => {
      const typeId = GlipTypeUtil.extractTypeId(id);
      if (itemTypeIds[typeId]) {
        itemTypeIds[typeId].push(id);
      } else {
        itemTypeIds[typeId] = [id];
      }
    });

    return itemTypeIds;
  }

  static fromJS(data: Post) {
    return new PostModel(data);
  }
}
