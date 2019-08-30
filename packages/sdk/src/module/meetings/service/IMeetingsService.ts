/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-31 14:53:53
 * Copyright © RingCentral. All rights reserved.
 */

import { StartMeetingResultType, MEETING_SERVICE_TYPE } from '../types';

interface IMeetingsService {
  startMeeting(groupIds: number[]): Promise<StartMeetingResultType>;
  getMeetingServiceType(): Promise<MEETING_SERVICE_TYPE>;
  getDialInNumber(isRCV: boolean): string;
  cancelMeeting(meetingId: number): Promise<void>;
  getJoinUrl(meetingId: number): Promise<string>;
}

export { IMeetingsService };
