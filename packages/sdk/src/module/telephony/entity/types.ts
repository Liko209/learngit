/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-05-24 14:57:55
 * Copyright © RingCentral. All rights reserved.
 */

import { CALL_DIRECTION } from 'sdk/module/RCItems';

enum CALL_STATE {
  IDLE = 'Idle',
  CONNECTING = 'Connecting',
  CONNECTED = 'Connected',
  DISCONNECTING = 'Disconnecting',
  DISCONNECTED = 'Disconnected',
}

enum HOLD_STATE {
  IDLE = 'idle',
  HELD = 'held',
  DISABLED = 'disabled',
}

enum RECORD_STATE {
  IDLE = 'idle',
  RECORDING = 'recording',
  RECORDING_DISABLED = 'recordingDisabled',
  DISABLED = 'disabled',
}

enum MUTE_STATE {
  IDLE = 'idle',
  MUTED = 'muted',
}

enum TRANSFER_TYPE {
  BLIND_TRANSFER,
  TO_VOICEMAIL,
  WARM_TRANSFER,
}

export {
  CALL_STATE,
  HOLD_STATE,
  RECORD_STATE,
  CALL_DIRECTION,
  MUTE_STATE,
  TRANSFER_TYPE,
};
