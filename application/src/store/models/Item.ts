/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-17 15:40:26
 * Copyright © RingCentral. All rights reserved.
 */
import { Item, ItemVersions } from 'sdk/module/item/entity';
import { observable, computed } from 'mobx';
import Base from './Base';

export default class ItemModel extends Base<Item> {
  @observable typeId: number | undefined;
  @observable modifiedAt: number | undefined;
  @observable creatorId: number | undefined;
  @observable name: string | undefined;
  @observable versions: Item['versions'] | undefined;
  @observable createdAt: number | undefined;
  @observable atMentionPostIds: number[] | undefined;

  constructor(data: Item) {
    super(data);
    const {
      type_id, modified_at, creator_id, name, created_at,
    } = data;
    this.typeId = type_id;
    this.modifiedAt = modified_at;
    this.creatorId = creator_id;
    this.name = name;
    this.atMentionPostIds = data.at_mentioning_post_ids;
    this.versions = data.versions;
    this.createdAt = created_at;
  }

  hasVersions() {
    return this.versions && this.versions.length > 0;
  }

  protected getVersionsValue<T = never>(
    type: keyof ItemVersions,
  ): T | undefined {
    if (!this.hasVersions()) return undefined;
    return (this.latestVersion && this.latestVersion[type]
      ? this.latestVersion[type]
      : undefined) as T | undefined;
  }

  @computed
  get newestCreatorId(): number {
    return this.getVersionsValue('creator_id') || 0;
  }

  @computed
  get latestVersion(): ItemVersions | undefined {
    return this.versions && this.versions.find(item => !item.deactivated);
  }

  static fromJS(data: Item) {
    return new ItemModel(data);
  }
}
