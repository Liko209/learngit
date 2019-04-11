/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-17 15:34:54
 * Copyright © RingCentral. All rights reserved.
 */
import { LinkItem } from 'sdk/module/item/entity';
import { observable, computed } from 'mobx';
import ItemModel from './Item';

export default class LinkItemModel extends ItemModel {
  @observable
  doNotRender: boolean;
  @observable
  deactivated: boolean;
  @observable
  summary: string;
  @observable
  title: string;
  @observable
  url: string;
  @observable
  image: string;
  @observable
  data?: {
    provider_name: string;
    favicon_url: string;
    url: string;
    title: string;
    object: {
      duration?: number;
      width?: number;
      html?: string;
      type?: 'video';
      height?: number;
    };
  };
  @observable
  favicon: string;
  @observable
  createdAt: number;
  @observable
  creatorId: number;

  constructor(data: LinkItem) {
    super(data);
    const {
      summary,
      title,
      url,
      image,
      deactivated,
      do_not_render,
      data: detail,
      favicon,
      created_at,
      creator_id,
    } = data;

    this.summary = summary || '';
    this.title = title || '';
    this.url = url;
    this.image = image || '';
    this.deactivated = deactivated;
    this.doNotRender = do_not_render || false;
    this.data = detail;
    this.favicon = favicon;
    this.createdAt = created_at;
    this.creatorId = creator_id;
  }

  @computed
  get isVideo() {
    const data = this.data;
    if (!data) {
      return false;
    }

    if (data.object && data.object.type && data.object.type === 'video') {
      return true;
    }
    return false;
  }

  @computed
  get providerName() {
    return (this.data && this.data.provider_name) || '';
  }

  @computed
  get faviconUrl() {
    return (this.data && this.data.favicon_url) || '';
  }

  static fromJS(data: LinkItem) {
    return new LinkItemModel(data);
  }
}
