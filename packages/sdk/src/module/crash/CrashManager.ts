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
  _onCrash: () => void;

  static getInstance() {
    if (!CrashManager._instance) {
      CrashManager._instance = new CrashManager();
    }
    return CrashManager._instance;
  }

  private constructor() {
    this._onCrash = _.debounce(this.onCrash, CRASH_HANDLE_DEBOUNCE);
    this._whiteScreenHandler = new WhiteScreenHandler();
  }

  monitor = () => {
    window.addEventListener('error', this._onCrash);
    window.addEventListener('unhandledrejection', this._onCrash);
  };

  dispose = () => {
    window.removeEventListener('error', this._onCrash);
    window.removeEventListener('unhandledrejection', this._onCrash);
  };

  onCrash = () => {
    if (Pal.instance.getWhiteScreenChecker()) {
      if (Pal.instance.getWhiteScreenChecker().isWhiteScreen()) {
        this._whiteScreenHandler.onCrash();
      }
    }
  };
}
