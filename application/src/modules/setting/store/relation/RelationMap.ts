/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-29 13:51:19
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action, ObservableSet, ObservableMap } from 'mobx';

class RelationMap<K, V> {
  @observable
  private _relations = new ObservableMap<K, Set<V>>();

  @action
  private _getChildrenSet(parent: K) {
    let items = this._relations.get(parent);
    if (!items) {
      items = new ObservableSet();
      this._relations.set(parent, items);
    }
    return items;
  }

  @action
  get(parent: K) {
    return [...this._getChildrenSet(parent)];
  }

  @action
  add(parent: K, child: V) {
    this._getChildrenSet(parent).add(child);
  }

  @action
  clear() {
    this._relations.clear();
  }
}

export { RelationMap };
