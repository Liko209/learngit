/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:51:45
 * Copyright © RingCentral. All rights reserved.
 */
enum CALL_SESSION_STATE {
  ACCEPTED = 'callsessionAccepted',
  CONFIRMED = 'callSessionConfirmed',
  DISCONNECTED = 'callSessionDisconnected',
  ERROR = 'callSessionError',
  PROGRESS = 'callSessionProgress',
  REINVITE_ACCEPTED = 'callSessionReinviteAccepted',
  REINVITE_FAILED = 'callSessionReinviteFailed',
}

enum CALL_FSM_NOTIFY {
  ON_ANSWERING = 'onAnswering',
  ON_PENDING = 'onPending',
  ON_CONNECTING = 'onConnecting',
  ON_CONNECTED = 'onConnected',
  ON_DISCONNECTED = 'onDisconnected',
  ON_LEAVE_CONNECTED = 'onLeaveConnected',
  ENTER_ANSWERING = 'enterAnswering',
  ENTER_PENDING = 'enterPending',
  ENTER_CONNECTING = 'enterConnecting',
  ENTER_CONNECTED = 'enterConnected',
  ENTER_DISCONNECTED = 'enterDisconnected',
  LEAVE_CONNECTED = 'leaveConnected',
  ANSWER_ACTION = 'answerAction',
  REJECT_ACTION = 'rejectAction',
  SEND_TO_VOICEMAIL_ACTION = 'sendToVoicemailAction',
  HANGUP_ACTION = 'hangupAction',
  CREATE_OUTGOING_CALL_SESSION = 'createOutgoingCallSession',
  FLIP_ACTION = 'flipAction',
  TRANSFER_ACTION = 'transferAction',
  START_RECORD_ACTION = 'startRecordAction',
  STOP_RECORD_ACTION = 'stopRecordAction',
  MUTE_ACTION = 'muteAction',
  UNMUTE_ACTION = 'unmuteAction',
  CALL_ACTION_SUCCESS = 'callActionSuccess',
  CALL_ACTION_FAILED = 'callActionFailed',
  HOLD_ACTION = 'holdAction',
  UNHOLD_ACTION = 'unholdAction',
  PARK_ACTION = 'parkAction',
  DTMF_ACTION = 'dtmfAction',
}

export { CALL_SESSION_STATE, CALL_FSM_NOTIFY };
