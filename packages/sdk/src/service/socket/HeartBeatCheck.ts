/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-03-14 21:01:17
 * Copyright © RingCentral. All rights reserved.
 */
import { getCurrentTime } from '../../utils/jsUtils';

class HeartBeatCheck {
  private _lastTick: number = 0;
  private _activityCheck?: NodeJS.Timeout;
  private _timeOutLength: number;
  private _timeOutCallback: (slice: number) => void;
  constructor(
    intervalTime: number,
    timeoutLength: number,
    timeOutCallback: () => void,
  ) {
    this._timeOutLength = timeoutLength;
    this._timeOutCallback = timeOutCallback;
    if (!this._activityCheck) {
      this._activityCheck = setInterval(() => {
        this._checkHeartBeat.bind(this);
      },                                intervalTime);
    }
  }

  cleanUp() {
    this._lastTick = 0;
    this._timeOutLength = 0;
    this._timeOutCallback = () => {};
    this._activityCheck && clearInterval(this._activityCheck);
    this._activityCheck = undefined;
  }

  private _checkHeartBeat() {
    const now = getCurrentTime();
    const slice = now - this._lastTick;
    if (this._lastTick && slice > this._timeOutLength) {
      this._timeOutCallback(slice);
    }
    this._lastTick = now;
  }
}

export { HeartBeatCheck };
