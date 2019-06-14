/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-05-23 14:25:45
 * Copyright © RingCentral. All rights reserved.
 */

const meetingData = {
  _id: 12664578068,
  created_at: 1558589662601,
  creator_id: 2826182659,
  version: 3140436453490688,
  model_size: 0,
  is_new: false,
  post_ids: [9763588128772],
  group_ids: [10525630466],
  status: 'ended',
  email: 'xmudate@163.com',
  first_name: 'xmudate',
  last_name: '163',
  function_id: 'meeting',
  company_id: 44466177,
  is_rc_video: false,
  zoom_id: '1499552188:3vDwOMgKSqiIN7H7g0NfaA==:ZDVeurbXTp2hut1mdCjoZg',
  zoom_uuid: '3vDwOMgKSqiIN7H7g0NfaA==',
  zoom_host_id: 'ZDVeurbXTp2hut1mdCjoZg',
  zoom_token:
    '7iBKQZ84y99XWp1IHdTasMxh0k8i4fDPM5m3MYr_JcU.BgQsVGhwT1BPazBrdllLMzJNL0xGU2dmR1UrMFlwRDBTajJzQ0xwbnBFODRqTT0AAAwzQ0JBdW9pWVMzcz0A',
  zoom_meeting_id: 1499552188,
  zoom_topic: 'Meeting',
  zoom_password: '',
  zoom_type: 1,
  h323_password: '',
  schedule_start_time: '',
  schedule_timezone: 'America/Los_Angeles',
  schedule_duration: 0,
  join_url: 'https://meetings.ringcentral.com/j/1499552188',
  start_url:
    'https://meetings.ringcentral.com/s/1499552188?zpk=yLFs4TBDjJsVuCm7ctAVIbSgsEdo1sTB6ijxL9iPmI4.AwckM2M0MzVkOWUtOTc2MS00NzVhLTg1ZDQtNzUzNmFlMTFmMjc5FlpEVmV1cmJYVHAyaHV0MW1kQ2pvWmcWWkRWZXVyYlhUcDJodXQxbWRDam9aZwt4bXVkYXRlIDE2M2MAgDdpQktRWjg0eTk5WFdwMUlIZFRhc014aDBrOGk0ZkRQTTVtM01Zcl9KY1UuQmdRc1ZHaHdUMUJQYXpCcmRsbExNekpOTDB4R1UyZG1SMVVyTUZsd1JEQlRhakp6UTB4d2JuQkZPRFJxVFQwQUFBd3pRMEpCZFc5cFdWTXpjejBBAAATR2xpcCBNaW51dGUgTWV0ZXJlZAICAQA',
  type_id: 20,
  modified_at: 1558589938149,
  deactivated: false,
  attendees: {
    '2266292227': true,
    '2826182659': true,
  },
  model_id: '12664578068',
  at_mentioning_post_ids: [],
  start_time: 1558589817992,
  new_version: 4052744579725674,
  end_time: 1558589938141,
};

import MeetingItemModel, {
  MEETING_STATUS,
  MEETING_DIAL_IN_NUMBER,
} from '../MeetingItem';
import _ from 'lodash';

describe('MeetingItemModel', () => {
  describe('constructor', () => {
    it('should have correct properties', () => {
      const model = MeetingItemModel.fromJS(meetingData);
      expect(model.status).toEqual('ended');
      expect(model.isRCVideo).toBeFalsy();
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
      const model = MeetingItemModel.fromJS(data);
      expect(model.meetingStatus).toEqual(expected);
    });
  });
  describe('getDialInNumber', () => {
    it('should return RC number', () => {
      const model = MeetingItemModel.fromJS(meetingData);
      expect(model.getDialInNumber()).toEqual(MEETING_DIAL_IN_NUMBER.RC);
    });
  });
  describe('duration', () => {
    it('should return end - start', () => {
      const model = MeetingItemModel.fromJS(meetingData);
      expect(model.duration).toEqual(
        meetingData.end_time - meetingData.start_time,
      );
    });
  });
});
