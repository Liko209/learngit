/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-19 17:42:05
 * Copyright © RingCentral. All rights reserved.
 */
import store from 'store2';
import { AbstractService } from '../../../framework/service/AbstractService';

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

  put(module: string, key: string, value: any) {
    const st = store.namespace(this._ns);
    st.set(`${module}.${key}`, value);
    // TODO emit notification FIJI-3770
  }

  get(module: string, key: string): any {
    const st = store.namespace(this._ns);
    return st.get(`${module}.${key}`);
  }

  remove(module: string, key: string) {
    const st = store.namespace(this._ns);
    return st.remove(`${module}.${key}`);
    // TODO remove from notification list FIJI-3770
  }

  on(module: string, key: string) {
    // TODO add to notification list FIJI-3770
  }

  off(module: string, key: string) {
    // TODO remove from notification list FIJI-3770
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
