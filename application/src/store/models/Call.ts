/*
 * @Author: Spike.Yang
 * @Date: 2019-05-28 13:43:37
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, autorun, computed, action } from 'mobx';
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
import i18next from 'i18next';
import { formatSeconds } from '@/utils/date';

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

  @observable
  private _seconds = 0;

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
      this.displayName = await getDisplayNameByCaller(this, true);
    });
  }

  @computed
  private get _timing() {
    const { secondTime, hourTime, minuteTime } = formatSeconds(this._seconds);
    let result = `${minuteTime}:${secondTime}`;
    if (hourTime !== '00') {
      result = `${hourTime}:${result}`;
    }
    return result;
  }

  private _intervalId?: NodeJS.Timeout;

  @action
  private _createInterval() {
    const { connectTime } = this;
    if (connectTime) {
      this._intervalId = setInterval(() => {
        this._seconds = Number(`${Date.now() - connectTime}`.slice(0, -3));
      }, 1000);
    }
  }

  @computed
  get time() {
    const { connectTime } = this;
    if (!connectTime) {
      return i18next.t('common.Connecting');
    }
    if (!this._intervalId) {
      this._createInterval();
      this._seconds = Number(`${Date.now() - connectTime}`.slice(0, -3));
    }
    return this._timing || '';
  }

  static fromJS(data: Call) {
    return new CallModel(data);
  }
}
