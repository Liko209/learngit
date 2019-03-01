/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-28 13:29:13
 * Copyright © RingCentral. All rights reserved.
 */
enum TELEPHONY_ACCOUNT_STATE {
  IDLE = 'Idle',
  REGISTERED = 'Registered',
  FAILED = 'Failed',
  UNREGISTERED = 'Unregistered',
  IN_PROGRESS = 'InProgress',
}

enum TELEPHONY_CALL_STATE {
  IDLE = 'Idle',
  CONNECTING = 'Connecting',
  CONNECTED = 'Connected',
  DISCONNECTED = 'Disconnected',
}

export { TELEPHONY_ACCOUNT_STATE, TELEPHONY_CALL_STATE };
