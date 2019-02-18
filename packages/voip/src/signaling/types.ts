/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-28 17:33:08
 * Copyright © RingCentral. All rights reserved.
 */
enum UA_EVENT {
  REG_SUCCESS = 'uaRegisterSuccess',
  REG_FAILED = 'uaRegisterFailed',
  REG_UNREGISTER = 'uaUnRegisterFailed',
  RECEIVE_INVITE = 'uaReceiveInvite',
}

enum WEBPHONE_SESSION_STATE {
  ACCEPTED = 'accepted',
  CONFIRMED = 'confirmed',
  BYE = 'bye',
  FAILED = 'failed',
  PROGRESS = 'progress',
  REINVITE_ACCEPTED = 'reinviteAccepted',
  REINVITE_FAILED = 'reinviteFailed',
}

enum RC_SIP_HEADER_NAME {
  RC_API_IDS = 'P-Rc-Api-Ids',
}

enum WEBPHONE_SESSION_EVENT {
  SDH_CREATED = 'SessionDescriptionHandler-created',
  ADD_TRACK = 'addTrack',
}

type ProvisionDataOptions = {
  appKey?: string;
  appName?: string;
  appVersion?: string;
  uuid?: string;
  logLevel?: string;
  audioHelper?: string;
  onSession?: string;
};

export {
  UA_EVENT,
  WEBPHONE_SESSION_STATE,
  RC_SIP_HEADER_NAME,
  WEBPHONE_SESSION_EVENT,
  ProvisionDataOptions,
};
