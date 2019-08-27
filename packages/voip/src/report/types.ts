/*
 * @Author: Spike.Yang
 * @Date: 2019-05-07 14:09:21
 * Copyright © RingCentral. All rights reserved.
 */

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
export type ValueOf<T> = T[keyof T];

export enum CALL_REPORT_PROPS {
  START_TIME = 'startTime',
  INVITE_SENT_TIME = 'inviteSentTime',
  RECEIVED_183_TIME = 'received183Time',
  RECEIVED_200_OK_TIME = 'received200OkTime',
  SENT_200_OK_TIME = 'sent200OkTime',
  ANSWER_TIME = 'answerTime',
  RECEIVED_ACK_TIME = 'receivedAckTime',
  MEDIA_CONNECTED_TIME = 'mediaConnectedTime',
  ESTABLISH_DURATION_BULK = 'establishDurationBulk',

  ID = 'id',
  SESSION_ID = 'sessionId',
  CREATE_TIME = 'createTime',
  UA = 'ua',
  DIRECTION = 'direction',
  ESTABLISHMENT = 'establishment',
  FSM_STATUS = 'fsmStatus',
}

export type FsmStatusCategory =
  | 'idle'
  | 'pending'
  | 'answering'
  | 'replying'
  | 'forwarding'
  | 'connecting'
  | 'connected'
  | 'holding'
  | 'holded'
  | 'unholding'
  | 'disconnected';

export enum CallEventCategory {
  InviteError = 'InviteError',
  RegistrationError = 'RegistrationError',
  MediaEvent = 'MediaEvent',
  NetworkEvent = 'NetworkEvent',
  CallAction = 'CallAction',
  CallActionSuccess = 'CallActionSuccess',
  CallActionFailed = 'CallActionFailed',
}

export type Establishment = Partial<{
  // out
  startTime: number;
  inviteSentTime: number;
  received183Time: number;
  received200OkTime: number;
  // in
  sent200OkTime: number;
  answerTime: number;
  receivedAckTime: number;
  mediaConnectedTime: number;
  // both
  establishDurationBulk: string;
}>;

export type FsmStatus = {
  name: FsmStatusCategory;
  timestamp: string;
};

export type CallEvent = {
  name: CallEventCategory;
  info: string;
  timestamp: string;
};

export interface ICallReport {
  id: string;
  createTime: Date | null;
  sessionId: string;
  ua: any;
  direction: 'incoming' | 'outgoing' | '';
  establishment: Establishment;
  events: CallEvent[];
  fsmStatus: FsmStatus[];
  media: MediaReportOutCome | null;
}

export type MediaReportProps =
  | 'packetsReceived'
  | 'bytesReceived'
  | 'packetsLost'
  | 'jitter'
  | 'fractionLost'
  | 'currentRoundTripTime'
  | 'packetsSent'
  | 'bytesSent';

export type MediaReportOutcomeItem<T> = {
  min: T;
  max: T;
  average?: T;
  variance?: T;
};

export type MediaReportItem<T> = {
  packetsReceived: T;
  bytesReceived: T;
  packetsLost: T;
  jitter: T | MediaReportOutcomeItem<T>;
  fractionLost: T | MediaReportOutcomeItem<T>;
  currentRoundTripTime: T | MediaReportOutcomeItem<T>;
  packetsSent: T;
  bytesSent: T;
  none?: boolean; // marker
};

export type MediaReportItemType = MediaReportItem<number>;

export type MediaReportOutCome = MediaReportItem<
  MediaReportOutcomeItem<number>
>;

export type MediaStatusReport = {
  inboundRtpReport: Pick<
    MediaReportItemType,
    | 'packetsReceived'
    | 'bytesReceived'
    | 'packetsLost'
    | 'jitter'
    | 'fractionLost'
  >;
  outboundRtpReport: Pick<MediaReportItemType, 'packetsSent' | 'bytesSent'>;
  rttMS: Pick<MediaReportItemType, 'currentRoundTripTime'>;
};
export interface IMediaReport {
  startAnalysis: (arg: any) => void;
  stopAnalysis: () => MediaReportOutCome;
  outcome: MediaReportOutCome | null;
}

export interface IAccumulator {
  addDateValue: (arg: number) => void;
  value: number;
  prop: MediaReportProps;
}
