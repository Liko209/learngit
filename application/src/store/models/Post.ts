/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-12-26 19:06:36
 * Copyright © RingCentral. All rights reserved.
 */

import { Post } from 'sdk/module/post/entity';
import { Item } from 'sdk/module/item/entity';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import Base from './Base';
import { observable, computed } from 'mobx';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import FileItemModel from '@/store/models/FileItem';
import LinkItemModel from '@/store/models/LinkItem';
import { mainLogger } from 'foundation/log';

export default class PostModel extends Base<Post> {
  createdAt: number;
  @observable
  text: string;
  @observable
  creatorId: number;
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
  itemData?: { version_map?: {} };
  @observable
  source?: string;
  @observable
  parentId?: number;
  @observable
  deactivated?: boolean;
  @observable icon?: string;
  @observable isTeamMention?: boolean;
  @observable isAdminMention?: boolean;

  constructor(data: Post) {
    super(data);
    const {
      created_at,
      creator_id,
      text,
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
      deactivated,
      icon,
      is_admin_mention,
      is_team_mention,
    } = data;
    this.createdAt = created_at;
    this.creatorId = creator_id;
    this.activityData = activity_data;
    this.activity = activity;
    this.text = text || '';
    this.atMentionNonItemIds = at_mention_non_item_ids;
    this.itemId = item_id;
    this.itemIds = item_ids || [];
    this.likes = likes;
    this.groupId = group_id;
    this.itemData = item_data;
    this.source = source;
    this.parentId = parent_id;
    this.deactivated = deactivated;
    this.icon = icon;
    this.isAdminMention = is_admin_mention;
    this.isTeamMention = is_team_mention;
  }

  @computed
  get existItemIds() {
    const ids = this.itemId ? [this.itemId] : this.itemIds;
    return ids
      .map((id: number) => {
        const typeId = GlipTypeUtil.extractTypeId(id);
        switch (typeId) {
          case TypeDictionary.TYPE_ID_FILE:
            return getEntity<Item, FileItemModel>(ENTITY_NAME.ITEM, id);
          case TypeDictionary.TYPE_ID_LINK:
            return getEntity<Item, LinkItemModel>(ENTITY_NAME.ITEM, id);
          default:
            return {
              id,
              deactivated: false,
            };
        }
      })
      .filter((item: any) => !item.deactivated)
      .map((item: any) => item.id);
  }

  @computed
  get itemTypeIds() {
    if (!this.existItemIds) {
      return undefined;
    }
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

  public fileItemVersion(fileItem: FileItemModel) {
    if (!this.itemData) {
      return 1;
    }
    const isFileItemReady = fileItem.id > 0;
    if (!isFileItemReady) return 1;

    const version =
      this.itemData.version_map && this.itemData.version_map[fileItem.id];

    if (!version) {
      // should not come here, due to exist bug, some data's version_map is incorrect. bug ticket: FIJI-6596
      mainLogger.error('can not find version info in post itemData', {
        itemData: this.itemData,
        fileId: fileItem.id,
      });
      return 1;
    }
    return version;
  }

  static fromJS(data: Post) {
    return new PostModel(data);
  }
}
