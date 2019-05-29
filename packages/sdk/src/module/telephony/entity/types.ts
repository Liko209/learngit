/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-05-24 14:57:55
 * Copyright © RingCentral. All rights reserved.
 */

enum CALL_STATE {
  IDLE,
  CONNECTING,
  CONNECTED,
  DISCONNECTED,
}

enum HOLD_STATE {
  IDLE,
  HELD,
  DISABLE,
}

export { CALL_STATE, HOLD_STATE };
