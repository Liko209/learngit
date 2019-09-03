/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-28 17:33:08
 * Copyright © RingCentral. All rights reserved.
 */
export enum UA_EVENT {
  REG_SUCCESS = 'uaRegisterSuccess',
  REG_FAILED = 'uaRegisterFailed',
  REG_UNREGISTER = 'uaUnRegisterFailed',
  RECEIVE_INVITE = 'uaReceiveInvite',
  TRANSPORT_ERROR = 'uaTransportError',
  SWITCH_BACK_PROXY = 'uaSwitchBackProxy',
  PROVISION_UPDATE = 'uaProvisionUpdate',
}

export enum WEBPHONE_SESSION_STATE {
  ACCEPTED = 'accepted',
  CONFIRMED = 'confirmed',
  BYE = 'bye',
  FAILED = 'failed',
  PROGRESS = 'progress',
  REINVITE_ACCEPTED = 'reinviteAccepted',
  REINVITE_FAILED = 'reinviteFailed',
}

export enum RC_SIP_HEADER_NAME {
  RC_API_IDS = 'P-Rc-Api-Ids',
}

export enum RC_REFER_EVENT {
  REFER_REQUEST_ACCEPTED = 'referRequestAccepted',
  REFER_REQUEST_REJECTED = 'referRequestRejected',
}

export enum WEBPHONE_SESSION_EVENT {
  SDH_CREATED = 'SessionDescriptionHandler-created',
  ADD_TRACK = 'addTrack',
}

export enum WEBPHONE_MEDIA_CONNECTION_STATE_EVENT {
  MEDIA_CONNECTION_STATE_CHANGED = 'mediaConnectionStateChanged',
  MEDIA_CONNECTION_NEW = 'mediaConnectionStateNew',
  MEDIA_CONNECTION_CHECKING = 'mediaConnectionStateChecking',
  MEDIA_CONNECTION_CONNECTED = 'mediaConnectionStateConnected',
  MEDIA_CONNECTION_COMPLETED = 'mediaConnectionStateCompleted',
  MEDIA_CONNECTION_FAILED = 'mediaConnectionStateFailed',
  MEDIA_CONNECTION_DISCONNECTED = 'mediaConnectionStateDisconnected',
  MEDIA_CONNECTION_CLOSED = 'mediaConnectionStateClosed',
}

export enum WEBPHONE_LOG_LEVEL {
  DEBUG = 'debug',
  LOG = 'log',
  WARN = 'warn',
  ERROR = 'error',
}

export type ProvisionDataOptions = {
  uuid?: string;
  appName?: string;
  appVersion?: string;
  logLevel?: string;
  builtinEnabled?: false;
  connector?: any;
  audioHelper?: string;
  onSession?: string;
  modifiers?: any;
  enableMidLinesInSDP?: boolean;
  enableQos?: boolean;
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

export type InviteOptions = {
  fromNumber?: string;
  homeCountryId?: string;
  extraHeaders?: any;
  RTCConstraints?: any;
  sessionDescriptionHandlerOptions?: any;
};

export type AcceptOptions = {
  sessionDescriptionHandlerOptions?: any;
};

export type MediaStatsReport = {
  inboundRtpReport?: InboundRtpReport;
  outboundRtpReport?: OutboundRtpReport;
  rttMS?: RttMS;
};
