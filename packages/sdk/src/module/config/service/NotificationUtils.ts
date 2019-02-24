/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-20 21:47:44
 * Copyright © RingCentral. All rights reserved.
 */
class NotificationUtils {
  private static instance: NotificationUtils;

  public static getInstance() {
    if (!NotificationUtils.instance) {
      NotificationUtils.instance = new NotificationUtils();
    }
    return NotificationUtils.instance;
  }

  private _list = new Set();
  on(module: string, key: string) {
    this._list.add(`${module}.${key}`);
  }

  off(module: string, key: string) {
    this._list.delete(`${module}.${key}`);
  }

  isExactMatch(module: string, key: string) {
    const con = `${module}.${key}`;
    for (const l of this._list) {
      if (l === con) {
        return true;
      }
    }
    return false;
  }

  isPartialMatch(prefix: string) {
    for (const l of this._list) {
      if (l.indexOf(prefix) === 0) {
        return true;
      }
    }
    return false;
  }

  getSize() {
    return this._list.size;
  }
}

export { NotificationUtils };
