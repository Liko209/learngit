/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-11 15:08:04
 * Copyright © RingCentral. All rights reserved.
 */
import { Item } from 'sdk/module/item/entity';
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

  hasVersions() {
    return this.versions && this.versions.length > 0;
  }

  private _getVersionsValue(type: string) {
    if (!this.hasVersions()) return null;
    return this.versions[0][type] ? this.versions[0][type] : null;
  }

  @computed
  get thumbs(): Thumbs | null {
    return this._getVersionsValue('thumbs');
  }

  @computed
  get pages() {
    if (!this.hasVersions()) return null;
    const { pages } = this.versions[0];
    return pages && pages.length > 0 ? pages : null;
  }

  @computed
  get versionUrl(): string | null {
    return this._getVersionsValue('url');
  }

  @computed
  get size() {
    return this._getVersionsValue('size');
  }

  @computed
  get downloadUrl() {
    return this._getVersionsValue('download_url');
  }

  @computed
  get status() {
    if (!this.hasVersions()) return null;
    return this._getVersionsValue('status');
  }

  @computed
  get origHeight() {
    return this._getVersionsValue('orig_height');
  }

  @computed
  get origWidth() {
    return this._getVersionsValue('orig_width');
  }

  @computed
  get storeFileId() {
    return this._getVersionsValue('stored_file_id');
  }

  @computed
  get iconType() {
    return getFileIcon(this.type);
  }

  static fromJS(data: Item) {
    return new FileItemModel(data);
  }
}

export { FileType, ExtendFileItem };
