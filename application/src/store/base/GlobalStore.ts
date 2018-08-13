import { action, ObservableMap, observable } from 'mobx';

import BaseStore from './BaseStore';

export default class GlobalStore extends BaseStore {
  data: ObservableMap = observable.map(new ObservableMap(), { deep: false });

  constructor() {
    super('global');
  }

  @action
  set(key: any, value: any) {
    this.data.set(key, value);
  }

  @action
  batchSet(data: Map<any, any>) {
    this.data.merge(data);
  }

  @action
  remove(key: any) {
    this.data.delete(key);
  }

  @action
  batchRemove(keys: any[]) {
    keys.forEach((key) => {
      this.remove(key);
    });
  }

  get(key: any) {
    return this.data.get(key);
  }

  clear() {
    this.data.clear();
  }
}
