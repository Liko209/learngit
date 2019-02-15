/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-27 17:42:00
 * Copyright © RingCentral. All rights reserved.
 */
type RTCSipProvisionInfo = {
  device: object;
  sipInfo: {
    transport: string;
    password: string;
    domain: string;
    username: string;
    authorizationId: string;
    outboundProxy: string;
  }[];
  sipFlags: object;
};

type RTCRegisterAsyncTask = {
  name: string;
  data?: any;
};

enum RTC_PROV_EVENT {
  NEW_PROV = 'newProv',
}

enum REGISTRATION_ERROR_CODE {
  TIME_OUT = 500,
}

enum REGISTRATION_EVENT {
  PROVISION_READY = 'provisionReady',
  RE_REGISTER = 'reRegister',
  ACCOUNT_STATE_CHANGED = 'accountStateChanged',
  MAKE_OUTGOING_CALL_TASK = 'makeOutgoingCallTask',
  RECEIVE_INCOMING_INVITE_TASK = 'receiveIncomingInviteTask',
  UA_REGISTER_SUCCESS = 'uaRegisterSuccess',
  UA_REGISTER_FAILED = 'uaRegisterFailed',
  UA_REGISTER_TIMEOUT = 'uaRegisterTimeout',
  UA_UNREGISTERED = 'uaUnregistered',
  NETWORK_CHANGE_TO_ONLINE = 'networkChangeToOnline',
  MAKE_OUTGOING_CALL = 'makeOutgoingCall',
  RECEIVE_INCOMING_INVITE = 'receiveIncomingInvite',
}

enum REGISTRATION_FSM_STATE {
  IDLE = 'idle',
  IN_PROGRESS = 'inProgress',
  READY = 'ready',
  FAILURE = 'failure',
  UNREGISTERED = 'unregistered',
}

enum REGISTRATION_FSM_NOTIFY {
  REG_IN_PROGRESS = 'onInProgress',
  READY = 'onReady',
  REG_FAILURE = 'onFailure',
  UN_REGISTERED = 'onUnregistered',
}

export {
  REGISTRATION_ERROR_CODE,
  REGISTRATION_FSM_STATE,
  REGISTRATION_FSM_NOTIFY,
  REGISTRATION_EVENT,
  RTC_PROV_EVENT,
  RTCSipProvisionInfo,
  RTCRegisterAsyncTask,
};
