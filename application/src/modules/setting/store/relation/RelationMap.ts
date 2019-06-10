/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-29 13:51:19
 * Copyright © RingCentral. All rights reserved.
 */
import { action, ObservableSet } from 'mobx';

class RelationMap<K, V> {
  private _relations = new Map<K, ObservableSet<V>>();

  private _useChildrenSet(parent: K) {
    let items = this._relations.get(parent);
    if (!items) {
      items = new ObservableSet();
      this._relations.set(parent, items!);
    }
    return items;
  }

  get(parent: K) {
    return [...this._useChildrenSet(parent)];
  }

  @action
  add(parent: K, child: V) {
    this._useChildrenSet(parent).add(child);
  }

  @action
  clear() {
    this._relations.forEach(relation => relation.clear());
    this._relations.clear();
  }
}

export { RelationMap };
