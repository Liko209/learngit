/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-27 17:42:00
 * Copyright © RingCentral. All rights reserved.
 */

export type RTCRegisterAsyncTask = {
  name: string;
  data?: any;
};

export enum RTC_PROV_EVENT {
  NEW_PROV = 'newProv',
  PROV_ARRIVE = 'provArrive',
}

export enum REGISTRATION_ERROR_CODE {
  SERVER_TIME_OUT = 504,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  PROXY_AUTHENTICATION_REQUIRED = 407,
}

export enum REGISTRATION_EVENT {
  PROVISION_READY = 'provisionReady',
  RE_REGISTER = 'reRegister',
  ACCOUNT_STATE_CHANGED = 'accountStateChanged',
  MAKE_OUTGOING_CALL_TASK = 'makeOutgoingCallTask',
  RECEIVE_INCOMING_INVITE_TASK = 'receiveIncomingInviteTask',
  UA_REGISTER_SUCCESS = 'uaRegisterSuccess',
  UA_REGISTER_FAILED = 'uaRegisterFailed',
  UA_REGISTER_TIMEOUT = 'uaRegisterTimeout',
  UA_UNREGISTERED = 'uaUnregistered',
  UA_TRANSPORT_ERROR = 'uaTransportError',
  UA_SWITCH_BACK_PROXY = 'uaSwitchBackProxy',
  NETWORK_CHANGE_TO_ONLINE = 'networkChangeToOnline',
  LOGOUT = 'logout',
  LOGOUT_ACTION = 'logoutAction',
  RECEIVE_INCOMING_INVITE = 'receiveIncomingInvite',
  REFRESH_PROV = 'refreshProvisioning',
  SWITCH_BACK_PROXY_ACTION = 'switchBackProxyAction',
}

export enum REGISTRATION_FSM_STATE {
  IDLE = 'idle',
  IN_PROGRESS = 'inProgress',
  READY = 'ready',
  FAILURE = 'failure',
  UNREGISTERED = 'unregistered',
}

export enum REGISTRATION_FSM_NOTIFY {
  REG_IN_PROGRESS = 'onInProgress',
  READY = 'onReady',
  REG_FAILURE = 'onFailure',
  UN_REGISTERED = 'onUnregistered',
}

export enum ALLOW_CALL_FLAG {
  OUTBOUND_CALL = 'outboundCall',
  EXTRA_OUTBOUND_CALL = 'extraOutboundCall',
  INBOUND_CALL = 'inboundCall',
}
