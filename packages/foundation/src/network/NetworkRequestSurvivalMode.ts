/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:41:44
 * Copyright © RingCentral. All rights reserved.
 */

import { SURVIVAL_MODE } from './network';

class NetworkRequestSurvivalMode {
  private _survivalMode = SURVIVAL_MODE.NORMAL;
  private _timer?: NodeJS.Timer;

  constructor(
    private _checkServerStatus: (
      callback: (success: boolean, interval: number) => void,
    ) => void,
  ) {}

  isSurvivalMode() {
    return this._survivalMode !== SURVIVAL_MODE.NORMAL;
  }

  setSurvivalMode(mode: SURVIVAL_MODE, interval: number) {
    if (this.isSurvivalMode()) {
      return;
    }
    this._survivalMode = mode;
    this.setupTimer(interval);
  }

  setupTimer(interval: number) {
    this._timer = setTimeout(() => {
      this.healthChecking();
    },                       interval);
  }

  clearTimer() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }
  }

  backToNormal() {
    this.clearTimer();
    this._survivalMode = SURVIVAL_MODE.NORMAL;
  }

  healthChecking() {
    this._checkServerStatus((success: boolean, retryAfter: number) => {
      if (success) {
        this.backToNormal();
        return;
      }
      const interval = retryAfter ? retryAfter * 1000 : 60000;
      this.setupTimer(interval);
    });
  }
}

export default NetworkRequestSurvivalMode;
