/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-10 19:28:52
 * Copyright © RingCentral. All rights reserved.
 */
import { action, ObservableMap, observable } from 'mobx';

import BaseStore from './BaseStore';
import { ENTITY_NAME } from '../constants';

export default class GlobalStore extends BaseStore {
  private _data: ObservableMap = observable.map(new Map(), { deep: false });

  constructor() {
    super(ENTITY_NAME.GLOBAL);
  }

  @action
  set(key: any, value: any) {
    this._data.set(key, value);
  }

  @action
  batchSet(data: Map<any, any>) {
    this._data.merge(data);
  }

  @action
  remove(key: any) {
    this._data.delete(key);
  }

  @action
  batchRemove(keys: any[]) {
    keys.forEach((key) => {
      this.remove(key);
    });
  }

  get(key: any) {
    return this._data.get(key);
  }

  clear() {
    this._data.clear();
  }
}
