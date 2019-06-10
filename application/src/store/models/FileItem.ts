/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-11 15:08:04
 * Copyright © RingCentral. All rights reserved.
 */
import { Item, ItemVersions } from 'sdk/module/item/entity';
import { observable, computed } from 'mobx';
import ItemModel from './Item';
import { getFileIcon } from '@/common/getFileIcon';
import { Thumbs } from 'sdk/module/item/module/base/entity/Item';

enum FileType {
  image = 0,
  document = 1,
  others = 2,
}

type ExtendFileItem = {
  item: FileItemModel;
  type: number;
  previewUrl: string;
};

export default class FileItemModel extends ItemModel {
  @observable type: string;
  @observable name: string;
  @observable isDocument?: boolean;
  @observable isNew: boolean;
  @observable creatorId: number;
  @observable versions: Item['versions'];
  @observable deactivated: Item['deactivated'];
  @observable createdAt: number;

  constructor(data: Item) {
    super(data);
    const {
      type,
      name,
      versions,
      is_document,
      is_new,
      deactivated,
      creator_id,
      created_at,
      modified_at,
    } = data;
    this.type = type;
    this.name = name;
    this.isDocument = is_document;
    this.isNew = is_new;
    this.versions = versions;
    this.deactivated = deactivated;
    this.creatorId = creator_id;
    this.createdAt = created_at;
    this.modifiedAt = modified_at;
  }

  @computed
  get thumbs(): Thumbs | null {
    return this.getVersionsValue('thumbs');
  }

  @computed
  get pages() {
    if (!this.hasVersions()) return null;
    const { pages } = this.latestVersion;
    return pages && pages.length > 0 ? pages : null;
  }

  @computed
  get versionUrl(): string | null {
    return this.getVersionsValue('url');
  }

  @computed
  get size() {
    return this.getVersionsValue('size');
  }

  @computed
  get downloadUrl() {
    return this.getVersionsValue('download_url');
  }

  @computed
  get status() {
    if (!this.hasVersions()) return null;
    return this.getVersionsValue('status');
  }

  @computed
  get origHeight() {
    return this.getVersionsValue('orig_height');
  }

  @computed
  get origWidth() {
    return this.getVersionsValue('orig_width');
  }

  @computed
  get storeFileId() {
    return this.getVersionsValue('stored_file_id');
  }

  @computed
  get iconType() {
    return getFileIcon(this.type);
  }

  @computed
  get latestVersion(): ItemVersions {
    return this.versions.find(item => !item.deactivated)!;
  }

  static fromJS(data: Item) {
    return new FileItemModel(data);
  }
}

export { FileType, ExtendFileItem };
