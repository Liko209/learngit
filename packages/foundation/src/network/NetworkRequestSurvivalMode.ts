/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:41:44
 * Copyright © RingCentral. All rights reserved.
 */
import { SURVIVAL_MODE_URIS } from './Constants';
import { SURVIVAL_MODE } from './network';

class NetworkRequestSurvivalMode {
  private survivalModeURIs = SURVIVAL_MODE_URIS;
  private survivalMode = SURVIVAL_MODE.NORMAL;
  private timer?: NodeJS.Timer;

  canSupportSurvivalMode(uri: string) {
    return Object.values(this.survivalModeURIs).includes(uri);
  }

  isSurvivalMode() {
    return this.survivalMode !== SURVIVAL_MODE.NORMAL;
  }

  setSurvivalMode(mode: SURVIVAL_MODE, interval: number) {
    if (this.isSurvivalMode()) {
      return;
    }

    this.survivalMode = mode;

    this.setupTimer(interval);
  }

  setupTimer(interval: number) {
    this.timer = setTimeout(
      () => {
        this.backToNormal();
      },
      interval);
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  backToNormal() {
    this.clearTimer();
    this.survivalMode = SURVIVAL_MODE.NORMAL;
  }
}

export default NetworkRequestSurvivalMode;
