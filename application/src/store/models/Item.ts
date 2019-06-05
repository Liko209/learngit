/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-17 15:40:26
 * Copyright © RingCentral. All rights reserved.
 */
import { Item } from 'sdk/module/item/entity';
import { observable, computed } from 'mobx';
import Base from './Base';

export default class ItemModel extends Base<Item> {
  @observable
  typeId: number;
  @observable
  modifiedAt: number;
  @observable
  creatorId: number;
  @observable
  name: string;
  @observable versions: Item['versions'];

  @observable
  createdAt: number;

  @observable
  atMentionPostIds?: number[];

  constructor(data: Item) {
    super(data);
    const { type_id, modified_at, creator_id, name, created_at } = data;
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

  private _getVersions(type: string) {
    return this.versions[0][type] ? this.versions[0][type] : null;
  }

  @computed
  get newestCreatorId(): number | null {
    if (!this.hasVersions()) return null;
    return this._getVersions('creator_id');
  }
  static fromJS(data: Item) {
    return new ItemModel(data);
  }
}
