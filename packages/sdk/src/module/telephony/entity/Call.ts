/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-05-24 14:21:27
 * Copyright © RingCentral. All rights reserved.
 */
import { IdModel } from '../../../framework/model';
import {
  CALL_STATE,
  HOLD_STATE,
  RECORD_STATE,
  CALL_DIRECTION,
  MUTE_STATE,
} from './types';

export type Call = IdModel & {
  call_id: string;
  to_num: string;
  from_num: string;
  call_state: CALL_STATE;
  hold_state: HOLD_STATE;
  record_state: RECORD_STATE;
  session_id: string;
  startTime: number;
  connectTime: number;
  disconnectTime: number;
  direction: CALL_DIRECTION;
  mute_state: MUTE_STATE;
};
