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
  TRANSPORT_ERROR = 'uaTransportError',
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

enum WEBPHONE_MEDIA_CONNECTION_STATE_EVENT {
  MEDIA_CONNECTION_NEW = 'mediaConnectionStateNew',
  MEDIA_CONNECTION_CHECKING = 'mediaConnectionStateNew',
  MEDIA_CONNECTION_CONNECTED = 'mediaConnectionStateConnected',
  MEDIA_CONNECTION_COMPLETED = 'mediaConnectionStateCompleted',
  MEDIA_CONNECTION_FAILED = 'mediaConnectionStateFailed',
  MEDIA_CONNECTION_DISCONNECTED = 'mediaConnectionStateDisconnected',
  MEDIA_CONNECTION_CLOSED = 'mediaConnectionStateClosed',
}

enum WEBPHONE_LOG_LEVEL {
  DEBUG = 'debug',
  LOG = 'log',
  WARN = 'warn',
  ERROR = 'error',
}

type ProvisionDataOptions = {
  uuid?: string;
  appName?: string;
  appVersion?: string;
  logLevel?: string;
  builtinEnabled?: false;
  connector?: any;
  audioHelper?: string;
  onSession?: string;
  maxReconnectionAttempts?: number;
  reconnectionTimeout?: number;
  connectionTimeout?: number;
  modifiers?: any;
};

type InboundRtpReport = {
  bytesReceived: number;
  fractionLost: number;
  jitter: number;
  mediaType: string;
  packetsLost: number;
  packetsReceived: number;
};

type OutboundRtpReport = {
  bytesSent: number;
  mediaType: string;
  packetsSent: number;
};

type RttMS = {
  currentRoundTripTime: number;
};

type MediaStatsReport = {
  inboundRtpReport?: InboundRtpReport;
  outboundRtpReport?: OutboundRtpReport;
  rttMS?: RttMS;
};

export {
  UA_EVENT,
  WEBPHONE_SESSION_STATE,
  WEBPHONE_MEDIA_CONNECTION_STATE_EVENT,
  WEBPHONE_LOG_LEVEL,
  RC_SIP_HEADER_NAME,
  WEBPHONE_SESSION_EVENT,
  ProvisionDataOptions,
  MediaStatsReport,
};
