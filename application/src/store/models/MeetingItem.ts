/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-05-23 14:26:14
 * Copyright © RingCentral. All rights reserved.
 */

import { MeetingItem } from 'sdk/module/item/entity';
import { observable, computed } from 'mobx';
import ItemModel from './Item';

const MEETING_DIAL_IN_NUMBER = {
  RC: '+1773-231-9226',
  ATT: '+1773-231-9324',
  TELUS: '+1855-959-9009',
};

enum MEETING_STATUS {
  NOT_STARTED,
  CANCELLED,
  FAILED,
  LIVE,
  EXPIRED,
  ENDED,
  NO_ANSWER,
  UN_KNOWN,
}

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

  constructor(data: MeetingItem) {
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
    this.isRcVideo = is_rc_video;
    this.startTime = start_time || 0;
    this.endTime = end_time || 0;
    this.zoomMeetingId = zoom_meeting_id;
  }

  @computed
  get duration() {
    return this.endTime - this.startTime;
  }

  @computed
  get meetingStatus() {
    const STATUS_MAP = {
      not_started: MEETING_STATUS.NOT_STARTED,
      cancelled: MEETING_STATUS.CANCELLED,
      failed: MEETING_STATUS.FAILED,
      live: MEETING_STATUS.LIVE,
      expired: MEETING_STATUS.EXPIRED,
      ended: MEETING_STATUS.ENDED,
      no_answer: MEETING_STATUS.NO_ANSWER,
    };
    if (STATUS_MAP.hasOwnProperty(this.status)) {
      return STATUS_MAP[this.status];
    }
    return MEETING_STATUS.UN_KNOWN;
  }

  getDialInNumber() {
    // TODO: different brands and types should have different numbers
    return MEETING_DIAL_IN_NUMBER.RC;
  }

  static fromJS(data: MeetingItem) {
    return new MeetingItemModel(data);
  }
}

export { MEETING_STATUS, MEETING_DIAL_IN_NUMBER };
