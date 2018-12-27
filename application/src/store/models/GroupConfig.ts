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

  constructor(data: GroupConfig) {
    super(data);
    const { draft } = data;

    this.draft = draft;
  }

  static fromJS(data: GroupConfig) {
    return new GroupConfigModel(data);
  }
}
