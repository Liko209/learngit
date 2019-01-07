/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:51:45
 * Copyright © RingCentral. All rights reserved.
 */

type RTCCallInfo = {
  fromName: string;
  fromNum: string;
  toName: string;
  toNum: string;
  uuid: string;
};

enum RTCCALL_STATE {
  IDLE = 'Idle',
  CONNECTING = 'Connecting',
  CONNECTED = 'Connected',
  DISCONNECTED = 'Disconnected',
}

enum RTC_CALL_ACTION {
  FLIP = 'flip',
  START_RECORD = 'startRecord',
  STOP_RECORD = 'stopRecord',
}

enum CALL_SESSION_STATE {
  CONFIRMED = 'callsessionstate.confirmed',
  DISCONNECTED = 'callsessionstate.disconnected',
  ERROR = 'callsessionstate.error',
}

enum CALL_FSM_NOTIFY {
  ON_ANSWERING = 'onAnswering',
  ON_PENDING = 'onPending',
  ON_CONNECTING = 'onConnecting',
  ON_CONNECTED = 'onConnected',
  ON_DISCONNECTED = 'onDisconnected',
  ENTER_ANSWERING = 'enterAnswering',
  ENTER_PENDING = 'enterPending',
  ENTER_CONNECTING = 'enterConnecting',
  ENTER_CONNECTED = 'enterConnected',
  ENTER_DISCONNECTED = 'enterDisconnected',
  ANSWER_ACTION = 'answerAction',
  REJECT_ACTION = 'rejectAction',
  SEND_TO_VOICEMAIL_ACTION = 'sendToVoicemailAction',
  HANGUP_ACTION = 'hangupAction',
  CREATE_OUTGOING_CALL_SESSION = 'createOutgoingCallSession',
  FLIP_ACTION = 'flipAction',
  START_RECORD_ACTION = 'startRecordAction',
  STOP_RECORD_ACTION = 'stopRecordAction',
  CALL_ACTION_SUCCESS = 'callActionSuccess',
  CALL_ACTION_FAILED = 'callActionFailed',
}

export {
  RTCCallInfo,
  RTCCALL_STATE,
  RTC_CALL_ACTION,
  CALL_SESSION_STATE,
  CALL_FSM_NOTIFY,
};
