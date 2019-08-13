/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-31 16:11:31
 * Copyright © RingCentral. All rights reserved.
 */
import { StartMeetingResultType } from '../../types';

interface IMeetingController {
  startMeeting(groupIds: number[]): Promise<StartMeetingResultType>;
}

export { IMeetingController };
