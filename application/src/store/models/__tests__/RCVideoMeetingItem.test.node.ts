/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-08-01 14:19:02
 * Copyright © RingCentral. All rights reserved.
 */

import { RCVideoMeetingItemModel } from '../RCVideoMeetingItem';

import { MEETING_STATUS } from '../MeetingsUtils';
import _ from 'lodash';

const meetingData = {
  _id: 564093035,
  creator_id: 1265106947,
  deactivated: false,
  group_ids: [318246019074],
  type_id: 107,
  unique: '27f24efa-a26d-409e-b9fd-56f41c4c2ddd',
  status: 'no_answer',
  created_at: new Date().getTime(),
  join_url: 'https://v.ringcentral.com/join/336609835',
  start_url: 'https://v.ringcentral.com/join/336609835',
  modified_at: 1564553988547,
  participants: [
    {
      id: '2aa7_427',
      glip_id: 1265106947,
      status: 'no_answer',
      extension_id: 807694011,
      account_id: 37439510,
      no_answer_time: 1564553988230,
    },
    {
      id: '2aa7_428',
      glip_id: 22262644739,
      status: 'reject',
      extension_id: 1516936020,
      account_id: 37439510,
      reject_time: 1564553988080,
    },
  ],
  notified_participants: {
    '807694011': false,
    '1516936020': false,
  },
  version: 306556774121472,
  company_id: 44466177,
  post_ids: [11141045649412],
  start_time: 1564553576800,
  end_time: 1564553641687,
  rc_video_type: 'video',
  bridge_id: 'iad01-c04-ndb33acae65ea16c46af25714d33',
  bridge_short_id: '336609835',
  participant_code: '336609835',
  host_code: '605478720',
  allow_join_before_host: true,
  conference_uri:
    '/restapi/v1.0/conferencing/bridge/iad01-c04-ndb33acae65ea16c46af25714d33',
  meeting_id: '336609835',
  rcv_meeting_id: 'iad01-c04-ndb33acae65ea16c46af25714d33_1564553980400!sjc01',
  rcv_meeting_ws_connection_url:
    'wss://ws-rcv.ringcentral.com/sfu/iad01-c04-ndb33acae65ea16c46af25714d33_1564553980400!sjc01',
  model_size: 0,
  is_new: false,
  model_id: '564093035',
  at_mentioning_post_ids: [],
};

describe('RCVideoMeetingItem', () => {
  describe('constructor', () => {
    it('should have correct properties', () => {
      const model = RCVideoMeetingItemModel.fromJS(meetingData);
      expect(model.status).toEqual('no_answer');
    });
  });
  describe('meetingStatus()', () => {
    it.each`
      expected                      | status
      ${MEETING_STATUS.NOT_STARTED} | ${'not_started'}
      ${MEETING_STATUS.CANCELLED}   | ${'cancelled'}
      ${MEETING_STATUS.FAILED}      | ${'failed'}
      ${MEETING_STATUS.LIVE}        | ${'live'}
      ${MEETING_STATUS.EXPIRED}     | ${'expired'}
      ${MEETING_STATUS.ENDED}       | ${'ended'}
      ${MEETING_STATUS.NO_ANSWER}   | ${'no_answer'}
      ${MEETING_STATUS.UN_KNOWN}    | ${'test'}
    `(`should work correctly with meeting status`, ({ status, expected }) => {
      const data = _.cloneDeep(meetingData);
      data['status'] = status;
      const model = RCVideoMeetingItemModel.fromJS(data);
      expect(model.meetingStatus).toEqual(expected);
    });
  });
  describe('duration', () => {
    it('should return end - start', () => {
      const model = RCVideoMeetingItemModel.fromJS(meetingData);
      expect(model.duration).toEqual(
        meetingData.end_time - meetingData.start_time,
      );
    });
  });
});
