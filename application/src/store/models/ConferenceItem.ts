/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-01-15 13:06:59
 * Copyright © RingCentral. All rights reserved.
 */

import { ConferenceItem, RC_Conference_Data } from 'sdk/module/item/entity';
import { observable, computed } from 'mobx';
import ItemModel from './Item';

export default class ConferenceItemModel extends ItemModel {
  @observable creatorId: number;
  @observable rcData: RC_Conference_Data;

  constructor(data: ConferenceItem) {
    super(data);
    const { creator_id, rc_data } = data;
    this.creatorId = creator_id;
    this.rcData = rc_data;
  }

  @computed
  get phoneNumber() {
    return (this.rcData && this.rcData.phoneNumber) || '';
  }

  @computed
  get hostCode() {
    return (this.rcData && this.rcData.hostCode) || '';
  }

  @computed
  get participantCode() {
    return (this.rcData && this.rcData.participantCode) || '';
  }

  static fromJS(data: ConferenceItem) {
    return new ConferenceItemModel(data);
  }
}
