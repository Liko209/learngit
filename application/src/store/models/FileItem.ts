/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-11 15:08:04
 * Copyright © RingCentral. All rights reserved.
 */
import { Item } from 'sdk/models';
import { observable, computed } from 'mobx';
import ItemModel from './Item';

enum FileType {
  image = 0,
  document = 1,
  others = 2,
}

type ExtendFileItem = {
  item: FileItemModal;
  type: number;
  previewUrl: string;
};

export default class FileItemModal extends ItemModel {
  @observable type: string;
  @observable name: string;
  @observable isDocument?: boolean;
  @observable isNew: boolean;
  @observable versions: Item['versions'];

  constructor(data: Item) {
    super(data);
    const { type, name, versions, is_document, is_new } = data;
    this.type = type;
    this.name = name;
    this.isDocument = is_document;
    this.isNew = is_new;
    this.versions = versions;
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

  static fromJS(data: Item) {
    return new FileItemModal(data);
  }
}

export { FileType, ExtendFileItem };
