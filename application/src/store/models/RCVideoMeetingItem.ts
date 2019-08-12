/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-08-01 13:48:27
 * Copyright © RingCentral. All rights reserved.
 */
import { RCVideoMeetingItem } from 'sdk/module/item/entity';
import { observable, computed } from 'mobx';
import ItemModel from './Item';

import { getMeetingStatus } from './MeetingsUtils';

export default class RCVideoMeetingItemModel extends ItemModel {
  @observable
  meetingId: string;

  @observable
  status: string;

  @observable
  joinUrl: string;

  @observable
  startUrl: string;

  @observable
  rcvMeetingId: string;

  @observable
  start: number;

  @observable
  startTime: number;

  @observable
  endTime: number;

  @observable
  end: number;

  constructor(data: RCVideoMeetingItem) {
    super(data);
    const {
      meeting_id,
      status,
      join_url,
      start_url,
      // rcv_meeting_id,
      start,
      start_time,
      end_time,
      end,
    } = data;
    this.start = start || 0;
    this.startTime = start_time;
    this.end = end || 0;
    this.endTime = end_time || 0;
    this.meetingId = meeting_id;
    // this.rcvMeetingId = meeting_id; // TODO need to be confirmed, why
    this.status = status;
    this.joinUrl = join_url;
    this.startUrl = start_url;
  }

  @computed
  get duration() {
    const end = this.end ? this.end : this.endTime;
    const start = this.start ? this.start : this.startTime;
    return end > start ? end - start : 0;
  }

  @computed
  get meetingStatus() {
    return getMeetingStatus(this.status, this.createdAt);
  }

  static fromJS(data: RCVideoMeetingItem) {
    return new RCVideoMeetingItemModel(data);
  }
}

export { RCVideoMeetingItemModel };
