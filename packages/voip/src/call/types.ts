/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2018-12-29 16:09:22
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
}

export { RTCCallInfo, RTCCALL_STATE, CALL_SESSION_STATE, CALL_FSM_NOTIFY };
