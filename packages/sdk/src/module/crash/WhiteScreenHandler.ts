/*
 * @Author: Paynter Chen
 * @Date: 2019-08-21 15:08:17
 * Copyright © RingCentral. All rights reserved.
 */

import { CrashGlobalConfig } from './CrashGlobalConfig';
import { WHITE_SCREEN_HANDLE_SPACE } from './constants';
import { AccountManager } from 'sdk/framework/account';
import { container } from 'sdk/container';

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
    (await caches.keys()).forEach(key => {
      caches.delete(key);
    });
    const registration = await navigator.serviceWorker.getRegistration('/');
    registration && (await registration.unregister());
    await container.get<AccountManager>(AccountManager.name).logout();
    window.location.reload();
  }
}
