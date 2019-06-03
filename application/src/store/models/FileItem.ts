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
import { AccountService } from 'sdk/module/account';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

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
    return this.versions[0][type] ? this.versions[0][type] : null;
  }

  @computed
  get thumbs(): Thumbs | null {
    if (!this.hasVersions()) return null;
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
    if (!this.hasVersions()) return null;
    return this._getVersionsValue('url');
  }

  @computed
  get size() {
    if (!this.hasVersions()) return null;
    return this._getVersionsValue('size');
  }

  @computed
  get downloadUrl() {
    if (!this.hasVersions()) return null;
    return this._getVersionsValue('download_url');
  }

  @computed
  get origHeight() {
    if (!this.hasVersions()) return null;
    return this._getVersionsValue('orig_height');
  }

  @computed
  get origWidth() {
    if (!this.hasVersions()) return null;
    return this._getVersionsValue('orig_width');
  }

  @computed
  get storeFileId() {
    if (!this.hasVersions()) return null;
    return this._getVersionsValue('stored_file_id');
  }

  @computed
  get iconType() {
    return getFileIcon(this.type);
  }

  @computed
  get canDeleteFile() {
    if (!this.hasVersions()) {
      return null;
    }
    const creatorId = this._getVersionsValue('creator_id');
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const currentUserId = userConfig.getGlipUserId();
    return creatorId === currentUserId;
  }

  static fromJS(data: Item) {
    return new FileItemModel(data);
  }
}

export { FileType, ExtendFileItem };
