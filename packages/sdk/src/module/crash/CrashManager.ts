/*
 * @Author: Paynter Chen
 * @Date: 2019-08-21 15:08:17
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { Pal } from 'sdk/pal';
import { CRASH_HANDLE_DEBOUNCE } from './constants';
import { WhiteScreenHandler } from './WhiteScreenHandler';

export class CrashManager {
  private static _instance: CrashManager;
  private _whiteScreenHandler: WhiteScreenHandler;
  onCrash: () => void;

  static getInstance() {
    if (!CrashManager._instance) {
      CrashManager._instance = new CrashManager();
    }
    return CrashManager._instance;
  }

  private constructor() {
    this.onCrash = _.debounce(this._onCrash, CRASH_HANDLE_DEBOUNCE);
    this._whiteScreenHandler = new WhiteScreenHandler();
  }

  monitor = () => {
    window.addEventListener('error', this.onCrash);
    window.addEventListener('unhandledrejection', this.onCrash);
  };

  dispose = () => {
    window.removeEventListener('error', this.onCrash);
    window.removeEventListener('unhandledrejection', this.onCrash);
  };

  private _onCrash = () => {
    if (
      Pal.instance.getWhiteScreenChecker() &&
      Pal.instance.getWhiteScreenChecker().isWhiteScreen()
    ) {
      this._whiteScreenHandler.onCrash();
    }
  };
}
