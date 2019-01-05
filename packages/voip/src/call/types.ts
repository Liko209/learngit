/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:51:45
 * Copyright © RingCentral. All rights reserved.
 */
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

export { CALL_SESSION_STATE, CALL_FSM_NOTIFY };
