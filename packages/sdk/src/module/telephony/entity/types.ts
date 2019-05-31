/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-05-24 14:57:55
 * Copyright © RingCentral. All rights reserved.
 */

enum CALL_STATE {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
}

enum HOLD_STATE {
  IDLE = 'idle',
  HELD = 'held',
  DISABLE = 'disable',
}

enum RECORD_STATE {
  IDLE = 'idle',
  RECORDING = 'recording',
  DISABLE = 'disable',
}

enum CALL_DIRECTION {
  OUTBOUND = 'outbound',
  INBOUND = 'inbound',
}

enum MUTE_STATE {
  IDLE = 'idle',
  MUTED = 'muted',
}

export { CALL_STATE, HOLD_STATE, RECORD_STATE, CALL_DIRECTION, MUTE_STATE };
