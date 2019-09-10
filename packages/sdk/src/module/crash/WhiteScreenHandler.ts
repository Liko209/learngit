/*
 * @Author: Paynter Chen
 * @Date: 2019-08-21 15:08:17
 * Copyright © RingCentral. All rights reserved.
 */

import { CrashGlobalConfig } from './CrashGlobalConfig';
import { WHITE_SCREEN_HANDLE_SPACE } from './constants';
import { AccountService } from 'sdk/module/account/service';
import { ServiceLoader, ServiceConfig } from '../serviceLoader';

export class WhiteScreenHandler {
  private _handled: boolean;

  async onCrash() {
    if (this._handled) return;
    const times = Number(CrashGlobalConfig.getWhiteScreenTimes() || 0) + 1;
    CrashGlobalConfig.setWhiteScreenTimes(times);
    const lastCrashTime = CrashGlobalConfig.getLastWhiteScreenTime();
    if (times > lastCrashTime.count + 2) {
      if (Date.now() - lastCrashTime.timeStamp > WHITE_SCREEN_HANDLE_SPACE) {
        this._handled = true;
        CrashGlobalConfig.setLastHandleWhiteScreenTime(times, Date.now());
        this.handleWhiteScreen();
      }
    }
  }

  async handleWhiteScreen() {
    await this._clearServiceWorkerCaches();
    const registration = await navigator.serviceWorker.getRegistration('/');
    registration && (await registration.unregister());
    await ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).onForceLogout(true);
  }

  private async _clearServiceWorkerCaches() {
    (await caches.keys()).forEach(key => {
      caches.delete(key);
    });
  }
}
