/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-27 17:42:00
 * Copyright © RingCentral. All rights reserved.
 */
const ErrorCode = {
  TIME_OUT: 500,
};

const RegistrationState = {
  IDLE: 'idle',
  REG_IN_PROGRESS: 'regInProgress',
  READY: 'ready',
  REG_FAILURE: 'regFailure',
  UN_REGISTERED: 'unRegistered',
};

const RegistrationManagerEvent = {
  RECEIVER_INCOMING_SESSION: 'RegitrationManangerEventReceiveIncomingSession',
};

export { ErrorCode, RegistrationState, RegistrationManagerEvent };
