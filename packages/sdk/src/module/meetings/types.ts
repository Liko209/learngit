/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-31 14:54:57
 * Copyright © RingCentral. All rights reserved.
 */

enum MEETING_ACTION {
  ERROR,
  DEEP_LINK,
}

type StartMeetingResultType = {
  action: MEETING_ACTION;
  link?: string;
  reason?: string;
};

enum MEETING_SERVICE_TYPE {
  RCV,
  ZOOM,
}

export { MEETING_ACTION, StartMeetingResultType, MEETING_SERVICE_TYPE };
