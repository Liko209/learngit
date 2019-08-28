/*
 * @Author: Spike.Yang
 * @Date: 2019-05-28 13:43:37
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, autorun } from 'mobx';
import Base from './Base';
import {
  Call,
  CALL_STATE,
  HOLD_STATE,
  CALL_DIRECTION,
  MUTE_STATE,
  RECORD_STATE,
} from 'sdk/module/telephony/entity';
import { getDisplayNameByCaller } from '@/modules/telephony/helpers';

export default class CallModel extends Base<Call> {
  @observable
  uuid: string;

  @observable
  toNum: string;

  @observable
  fromNum: string;

  @observable
  callState: CALL_STATE;

  @observable
  holdState: HOLD_STATE;

  @observable
  connectingTime: number;

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

  @observable
  fromName: string;

  @observable
  toName: string;

  @observable
  displayName: string;

  constructor(data: Call) {
    super(data);
    const {
      uuid,
      to_num,
      from_num,
      call_state,
      hold_state,
      record_state,
      session_id,
      startTime,
      connectingTime,
      connectTime,
      disconnectTime,
      direction,
      mute_state,
      from_name,
      to_name,
    } = data;

    this.uuid = uuid;
    this.toNum = to_num;
    this.fromNum = from_num;
    this.callState = call_state;
    this.holdState = hold_state;
    this.recordState = record_state;
    this.sessionId = session_id;
    this.startTime = startTime;
    this.connectingTime = connectingTime;
    this.connectTime = connectTime;
    this.disconnectTime = disconnectTime;
    this.direction = direction;
    this.muteState = mute_state;
    this.fromName = from_name;
    this.toName = to_name;

    autorun(async () => {
      this.displayName = await getDisplayNameByCaller(this);
    });
  }

  static fromJS(data: Call) {
    return new CallModel(data);
  }
}
