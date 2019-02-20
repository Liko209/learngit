/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-11 15:08:04
 * Copyright © RingCentral. All rights reserved.
 */
import { Item } from 'sdk/module/item/entity';
import { observable, computed } from 'mobx';
import ItemModel from './Item';
import { getFileIcon } from '@/common/getFileIcon';

enum FileType {
  image = 0,
  document = 1,
  others = 2,
}

type FileInfoCore = {
  id: number;
  type: string;
  name: string;
  origHeight: number;
  origWidth: number;
  isMocked: boolean;
  downloadUrl: string;
  versionUrl: string;
  size: number;
  deactivated: boolean;
};

type ExtendFileItem = {
  item: FileInfoCore;
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
    } = data;
    this.type = type;
    this.name = name;
    this.isDocument = is_document;
    this.isNew = is_new;
    this.versions = versions;
    this.deactivated = deactivated;
    this.creatorId = creator_id;
    this.createdAt = created_at;
  }

  hasVersions() {
    return this.versions && this.versions.length > 0;
  }

  private _getVersionsValue(type: string) {
    return this.versions[0][type] ? this.versions[0][type] : null;
  }

  @computed
  get thumbs() {
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
  get iconType() {
    return getFileIcon(this.type);
  }

  toCoreObject = () => {
    const result: FileInfoCore = {
      id: this.id,
      type: this.type,
      name: this.name,
      origHeight: this.origHeight,
      origWidth: this.origWidth,
      isMocked: this.isMocked,
      downloadUrl: this.downloadUrl,
      versionUrl: this.versionUrl || '',
      size: this.size,
      deactivated: this.deactivated,
    };
    return result;
  }

  static fromJS(data: Item) {
    return new FileItemModel(data);
  }
}

export { FileType, ExtendFileItem };
