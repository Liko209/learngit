/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-10 19:28:52
 * Copyright © RingCentral. All rights reserved.
 */
import { action, get, set, remove, observable } from 'mobx';

import BaseStore from './BaseStore';
import { ENTITY_NAME } from '../constants';
import { GLOBAL_VALUES } from '../config';

export default class GlobalStore extends BaseStore {
  private _data = observable.object<typeof GLOBAL_VALUES>(
    GLOBAL_VALUES,
    {},
    { deep: false },
  );

  constructor() {
    super(ENTITY_NAME.GLOBAL);
  }

  @action
  set<K extends keyof typeof GLOBAL_VALUES>(
    key: K,
    value: (typeof GLOBAL_VALUES)[K],
  ) {
    set(this._data, key, value);
  }

  @action
  batchSet<K extends keyof typeof GLOBAL_VALUES>(
    data: Partial<typeof GLOBAL_VALUES>,
  ) {
    Object.keys(data).forEach((key: keyof typeof GLOBAL_VALUES) => {
      this.set(key, data[key] as typeof GLOBAL_VALUES[K]);
    });
  }

  @action
  remove(key: keyof typeof GLOBAL_VALUES) {
    remove(this._data, key);
  }

  @action
  batchRemove(keys: any[]) {
    keys.forEach((key: keyof typeof GLOBAL_VALUES) => {
      this.remove(key);
    });
  }

  get(key: keyof typeof GLOBAL_VALUES) {
    return get(this._data, key);
  }
}
