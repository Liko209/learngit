/*
 * @Author: doyle.wu
 * @Date: 2018-12-25 10:14:45
 */

import { LogUtils } from './logUtils';

const logger = LogUtils.getLogger(__filename);

class FuncUtils {
  static contain(func: Function, funcArr: Array<Function>): boolean {
    let funcId = func.toString();
    for (let f of funcArr) {
      if (funcId === f.toString()) {
        return true;
      }
    }
    return false;
  }

  /**
   * @param target : EventEmitter
   */
  static bindEvent(target, eventName: string, func: Function): boolean {
    let listeners = target.listeners(eventName);
    let needBind = !this.contain(func, listeners);

    if (needBind) {
      target.on(eventName, func);
    }

    logger.info(`${eventName} listener size : ${listeners.length}, needBind : ${needBind}`);
    return needBind;
  }

  static unbindEvent(target, eventName: string, func: Function): boolean {
    let listeners = target.listeners(eventName);
    let contain = this.contain(func, listeners);

    if (contain) {
      target.off(eventName, func);
    }

    return contain;
  }
}

export {
  FuncUtils
}
