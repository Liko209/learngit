/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-20 14:45:40
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel } from 'sdk/framework/model';
import {
  CALL_TYPE,
  CALL_ACTION,
  CALL_RESULT,
  CALL_REASON,
  INDICATES_RECORDING_MODE,
  CALL_TRANSPORT,
  LEG_TYPE,
} from '../constants';
import { Caller, CallerView, UriModel } from '../../types';
import { CALL_DIRECTION } from '../../constants';

type CallRecording = UriModel<string> & {
  type: INDICATES_RECORDING_MODE;
  contentUri: string;
};

type CallLeg = {
  action: CALL_ACTION;
  direction: CALL_DIRECTION;
  duration: number;
  extension: UriModel<number>;
  legType: LEG_TYPE;
  startTime: string;
  type: CALL_TYPE;
  result: CALL_RESULT;
  from: Caller;
  to: Caller;
  transport: CALL_TRANSPORT;
  recording: CallRecording;
  master: boolean;
};

type CallLog = IdModel<string> & {
  uri: string;
  sessionId: string;
  from: Caller;
  to: Caller;
  type: CALL_TYPE;
  direction: CALL_DIRECTION;
  action: CALL_ACTION;
  result: CALL_RESULT;
  reason?: CALL_REASON;
  startTime: string;
  duration: number;
  recording?: CallRecording;
  lastModifiedTime?: string; // For 'Detailed' view only
  transport?: CALL_TRANSPORT; // For 'Detailed' view only
  extension?: UriModel<number>;
  delegate?: {
    id: string;
    name: string;
  };
  legs?: CallLeg[]; // For 'Detailed' view only
  message?: {
    id: string;
    type: string;
    uri: string;
  };
  deleted?: boolean;
  __localInfo: number;
  __timestamp: number;
  __isPseudo?: boolean;
};

type CallLogView = IdModel<string> & {
  caller?: CallerView;
  __localInfo: number;
  __timestamp: number;
};

export { CallLog, CallLogView };
