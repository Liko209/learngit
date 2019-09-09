/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-20 10:58:42
 * Copyright © RingCentral. All rights reserved.
 */
import Mousetrap from 'mousetrap';
import { mainLogger } from 'foundation/log';
import { GLOBAL_HOT_KEYS } from './globalKeys.config';

type globalKeyCb = (e: KeyboardEvent, combo: string) => boolean;
type Handler =
  | globalKeyCb
  | {
      handler: globalKeyCb;
      action: string;
    };

class GlobalKeysManager {
  private _mousetrap: MousetrapInstance;

  constructor() {
    this._mousetrap = new Mousetrap(document.body);
  }

  private _errorTip(type: string, key: string, hotKeyType: string) {
    mainLogger.error(
      `[Global Hotkey] type: '${type}' key: '${key}' already exist in ${hotKeyType}.`,
    );
  }

  checkConflict() {
    const cacheKeys = {};

    Object.keys(GLOBAL_HOT_KEYS).forEach((type: string) => {
      const keys = GLOBAL_HOT_KEYS[type];
      if (Array.isArray(keys)) {
        keys.forEach((key: string) => {
          if (cacheKeys[key]) {
            this._errorTip(type, key, cacheKeys[key]);
          } else {
            cacheKeys[key] = type;
          }
        });
      } else if (cacheKeys[keys]) {
        this._errorTip(type, keys, cacheKeys[keys]);
      } else {
        cacheKeys[keys] = type;
      }
    });
  }

  /**
   *
   * @param key short cut to trigger handler
   * @param handler when return true, allow browser behavior;
   * when return false, prevent browser behavior.
   */
  addGlobalKey(key: string | string[], handler: Handler) {
    this.checkConflict();
    if (typeof handler === 'object') {
      this._mousetrap.bind(key, handler.handler, handler.action);
    } else {
      this._mousetrap.bind(key, handler);
    }
  }

  removeGlobalKey(key: string | string[]) {
    this._mousetrap.unbind(key);
  }

  resetAllKeys() {
    this._mousetrap.reset();
  }
}

const globalKeysManager = new GlobalKeysManager();

export { globalKeysManager };
