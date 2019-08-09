/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-21 09:39:00
 * Copyright © RingCentral. All rights reserved.
 */

enum PRESENCE {
  NOTREADY = 'NotReady',
  UNAVAILABLE = 'Unavailable',
  AVAILABLE = 'Available',
  ONCALL = 'OnCall',
  DND = 'DND',
  INMEETING = 'InMeeting',
}

enum PRESENCE_REQUEST_STATUS {
  AWAY = 'away',
  ONLINE = 'online',
}

export { PRESENCE, PRESENCE_REQUEST_STATUS };
