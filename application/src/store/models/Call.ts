/*
 * @Author: Spike.Yang
 * @Date: 2019-05-28 13:43:37
 * Copyright © RingCentral. All rights reserved.
 */
import { observable } from 'mobx';
import Base from './Base';
import {
  Call,
  CALL_STATE,
  HOLD_STATE,
  CALL_DIRECTION,
  MUTE_STATE,
  RECORD_STATE,
} from 'sdk/module/telephony/entity';

export default class CallModel extends Base<Call> {
  @observable
  callId: string;

  @observable
  toNum: string;

  @observable
  fromNum: string;

  @observable
  callState: CALL_STATE;

  @observable
  holdState: HOLD_STATE;

  @observable
  connectTime: number;

  @observable
  direction: CALL_DIRECTION;

  @observable
  disconnectTime: number;

  @observable
  muteState: MUTE_STATE;

  @observable
  startTime: number;

  @observable
  recordState: RECORD_STATE;

  @observable
  sessionId: string;

  constructor(data: Call) {
    super(data);
    const {
      call_id,
      to_num,
      from_num,
      call_state,
      hold_state,
      record_state,
      session_id,
      startTime,
      connectTime,
      disconnectTime,
      direction,
      mute_state,
    } = data;

    this.callId = call_id;
    this.toNum = to_num;
    this.fromNum = from_num;
    this.callState = call_state;
    this.holdState = hold_state;
    this.recordState = record_state;
    this.sessionId = session_id;
    this.startTime = startTime;
    this.connectTime = connectTime;
    this.disconnectTime = disconnectTime;
    this.direction = direction;
    this.muteState = mute_state;
  }

  static fromJS(data: Call) {
    return new CallModel(data);
  }
}
