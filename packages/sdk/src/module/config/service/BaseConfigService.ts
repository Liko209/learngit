/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-19 17:42:05
 * Copyright © RingCentral. All rights reserved.
 */
import store from 'store2';
import { AbstractService } from '../../../framework/service/AbstractService';
import notificationCenter from '../../../service/notificationCenter';
import { CONFIG_EVENT_TYPE } from '../constants';
import { Listener } from 'eventemitter2';

class BaseConfigService extends AbstractService {
  private _ns: string;

  protected onStarted() {}
  protected onStopped() {}

  protected setNameSpace(ns: string) {
    this._ns = ns;
  }

  protected getNameSpace(): string {
    return this._ns;
  }

  protected get store() {
    return store.namespace(this._ns);
  }

  put(module: string, key: string, value: any) {
    this.store.set(`${module}.${key}`, value);
    notificationCenter.emit(
      `${this._ns}.${module}.${key}`,
      CONFIG_EVENT_TYPE.UPDATE,
      key,
      value,
    );
  }

  get(module: string, key: string): any {
    return this.store.get(`${module}.${key}`);
  }

  remove(module: string, key: string) {
    this.store.remove(`${module}.${key}`);
    notificationCenter.emit(
      `${this._ns}.${module}.${key}`,
      CONFIG_EVENT_TYPE.REMOVE,
      key,
    );
  }

  on(module: string, key: string, listener: Listener) {
    notificationCenter.on(`${this._ns}.${module}.${key}`, listener);
  }

  off(module: string, key: string, listener: Listener) {
    notificationCenter.off(`${this._ns}.${module}.${key}`, listener);
  }

  clear() {
    const st = store.namespace(`${this._ns}`);
    do {
      const arr = st.keys();
      if (arr.length === 0) {
        break;
      }
      st.clear();
    } while (true);
    // TODO clearAll notification FIJI-3770
  }
}

export { BaseConfigService };
