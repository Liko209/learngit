/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-05-23 14:26:14
 * Copyright © RingCentral. All rights reserved.
 */
import { ZoomMeetingItem } from 'sdk/module/item/entity';
import { observable, computed } from 'mobx';
import ItemModel from './Item';

import { getMeetingStatus, ZOOM_MEETING_DIAL_IN_NUMBER } from './MeetingsUtils';

export default class MeetingItemModel extends ItemModel {
  @observable
  status: string;

  @observable
  startUrl: string;

  @observable
  joinUrl: string;

  @observable
  isRcVideo: boolean;

  @observable
  startTime: number;

  @observable
  endTime: number;

  @observable
  zoomMeetingId: number;

  constructor(data: ZoomMeetingItem) {
    super(data);
    const {
      status,
      start_url,
      join_url,
      is_rc_video,
      start_time,
      end_time,
      zoom_meeting_id,
    } = data;
    this.status = status;
    this.startUrl = start_url || '';
    this.joinUrl = join_url || '';
    this.isRcVideo = is_rc_video || false;
    this.startTime = start_time || 0;
    this.endTime = end_time || 0;
    this.zoomMeetingId = zoom_meeting_id || 0;
  }

  @computed
  get duration() {
    return this.endTime - this.startTime;
  }

  @computed
  get meetingStatus() {
    return getMeetingStatus(this.status, this.createdAt);
  }

  getDialInNumber() {
    // TODO: different brands and types should have different numbers
    return ZOOM_MEETING_DIAL_IN_NUMBER.RC;
  }

  static fromJS(data: ZoomMeetingItem) {
    return new MeetingItemModel(data);
  }
}

export { MeetingItemModel };
