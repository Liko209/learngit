/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-17 15:34:54
 * Copyright © RingCentral. All rights reserved.
 */
import { LinkItem } from 'sdk/models';
import { observable } from 'mobx';
import ItemModel from './Item';

export default class LinkItemModal extends ItemModel {
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
  providerName: string;
  @observable
  favicon: string;

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
    } = data;
    this.summary = summary || '';
    this.title = title || '';
    this.url = url;
    this.image = image || '';
    this.deactivated = deactivated;
    this.doNotRender = do_not_render || false;
    this.providerName = detail && detail.provider_name;
    this.favicon = favicon;
  }

  static fromJS(data: LinkItem) {
    return new LinkItemModal(data);
  }
}
