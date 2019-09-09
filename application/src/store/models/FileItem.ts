/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-11 15:08:04
 * Copyright © RingCentral. All rights reserved.
 */
import { Item, ItemVersions, ItemVersionPage } from 'sdk/module/item/entity';
import { observable, computed } from 'mobx';
import ItemModel from './Item';
import { getFileIcon } from '@/common/getFileIcon';
import { Thumbs } from 'sdk/module/item/module/base/entity/Item';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { PostService } from 'sdk/module/post';
import moize from 'moize';

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
  @observable isDocument?: boolean;
  @observable isNew: boolean;
  @observable creatorId: number;
  @observable deactivated: Item['deactivated'];

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
  get thumbs() {
    return this.getVersionsValue<Thumbs>('thumbs');
  }

  @computed
  get pages(): ItemVersionPage[] {
    const pages = this.latestVersion && this.latestVersion.pages;
    return pages || [];
  }

  @computed
  get versionUrl() {
    return this.getVersionsValue<string>('url') || '';
  }

  @computed
  get size() {
    return this.getVersionsValue<number>('size') || 0;
  }

  @computed
  get downloadUrl() {
    return this.getVersionsValue<string>('download_url') || '';
  }

  @computed
  get status() {
    return this.getVersionsValue<string>('status') || '';
  }

  @computed
  get ready() {
    return this.getVersionsValue<boolean>('ready') || false;
  }

  @computed
  get origHeight() {
    return this.getVersionsValue<number>('orig_height') || 0;
  }

  @computed
  get origWidth() {
    return this.getVersionsValue<number>('orig_width') || 0;
  }

  @computed
  get storeFileId() {
    return this.getVersionsValue<number>('stored_file_id') || 0;
  }

  @computed
  get iconType() {
    return getFileIcon(this.type);
  }

  @computed
  get latestVersion(): ItemVersions | undefined {
    return this.versions && this.versions.find(item => !item.deactivated);
  }

  getDirectRelatedPostInGroup(groupId: number) {
    return this._getDirectRelatedPostInGroup(groupId);
  }

  private _getDirectRelatedPostInGroup = moize.promise((groupId: number) => {
    const postService = ServiceLoader.getInstance<PostService>(
      ServiceConfig.POST_SERVICE,
    );
    return postService.getLatestPostIdByItem(groupId, this.id);
  });

  static fromJS(data: Item) {
    return new FileItemModel(data);
  }
}

export { FileType, ExtendFileItem };
