/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-27 10:01:17
 * Copyright © RingCentral. All rights reserved.
 */
import { observable } from 'mobx';
import { GroupConfig } from 'sdk/models';
import Base from './Base';

export default class GroupConfigModel extends Base<GroupConfig> {
  @observable
  draft?: string;
  @observable
  attachmentItemIds?: number[];
  @observable
  sendFailurePostIds?: number[];

  constructor(data: GroupConfig) {
    super(data);
    const { draft, send_failure_post_ids, attachment_item_ids } = data;
    this.draft = draft;
    this.attachmentItemIds = attachment_item_ids;
    this.sendFailurePostIds = send_failure_post_ids;
  }

  static fromJS(data: GroupConfig) {
    return new GroupConfigModel(data);
  }
}
