/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-19 17:42:05
 * Copyright © RingCentral. All rights reserved.
 */
import store from 'store2';
import { AbstractService } from '../../../framework/service/AbstractService';
import { container } from '../../../container';

class BaseConfigService extends AbstractService {
  private _ns: string;

  protected onStarted() {}
  protected onStopped() {}

  static getInstance<T extends BaseConfigService>(): T {
    return container.get(this.name);
  }

  protected setNameSpace(ns: string) {
    this._ns = ns;
  }

  protected getNameSpace(): string {
    return this._ns;
  }

  put(module: string, key: string, value: any) {
    const st = store.namespace(this._ns);
    st.set(`${module}.${key}`, value);
    // TODO emit notificaition
    // if (
    //   (key === '' && notifyManager.isPartialMatch(`${this._ns}.${module}`)) ||
    //   notifyManager.isExactMatch(`${this._ns}.${module}`, key)
    // ) {
    //   notificationCenter.emitKVChange(`${this._ns}.${module}.${key}`, value);
    // }
  }

  get(module: string, key: string): any {
    const st = store.namespace(this._ns);
    return st.get(`${module}.${key}`);
  }

  remove(module: string, key: string) {
    const st = store.namespace(this._ns);
    return st.remove(`${module}.${key}`);
    // TODO remove from notification list
  }

  on(module: string, key: string) {
    // TODO add to notification list
  }

  off(module: string, key: string) {
    // TODO remove from notification list
  }

  clear() {
    const st = store.namespace(this._ns);
    st.clearAll();
    // TODO clearAll notification
  }
}

export { BaseConfigService };
