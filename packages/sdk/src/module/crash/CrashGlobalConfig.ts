/*
 * @Author: Paynter Chen
 * @Date: 2019-08-21 15:18:35
 * Copyright © RingCentral. All rights reserved.
 */

import { GlobalConfig } from 'sdk/module/config/GlobalConfig';
import { CRASH_KEYS } from './constants';

class CrashGlobalConfig extends GlobalConfig {
  static moduleName = 'crash';

  static setWhiteScreenTimes(times: number) {
    this.put(CRASH_KEYS.WHITE_SCREEN_TIMES, times);
  }

  static getWhiteScreenTimes() {
    return this.get(CRASH_KEYS.WHITE_SCREEN_TIMES);
  }

  static setLastHandleWhiteScreenTime(count: number, timeStamp: number) {
    this.put(
      CRASH_KEYS.LAST_HANDLE_WHITE_SCREEN_TIME,
      JSON.stringify({ count, timeStamp }),
    );
  }

  static getLastWhiteScreenTime(): { count: number; timeStamp: number } {
    const t = this.get(CRASH_KEYS.LAST_HANDLE_WHITE_SCREEN_TIME);
    if (t) {
      return JSON.parse(t);
    }
    return {
      count: 0,
      timeStamp: 0,
    };
  }
}

export { CrashGlobalConfig };
