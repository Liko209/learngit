/*
 * @Author: Paynter Chen
 * @Date: 2019-06-09 12:27:04
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';

import { logManager } from '../log';
import { BuildUtils } from '../utils';
import { IRegisterItemManager, UniqueItem } from './types';

const LOG_TAG = '[RegisterItemManager]';

export class RegisterItemManager<T extends UniqueItem>
  implements IRegisterItemManager<T> {
  private _items: T[] = [];

  constructor(private _name: string) {}

  register(item: T): void {
    const duplicateItem = _.find(
      this._items,
      (it: T) => it.identify === item.identify,
    );
    if (duplicateItem) {
      const warnText = `register item: ${item.name} is duplicate with: ${
        duplicateItem.name
      }`;
      logManager
        .getLogger(LOG_TAG)
        .tags(this._name)
        .warn(warnText);
      if (
        !BuildUtils.isProductionBuild() &&
        !BuildUtils.isPublicBuild() &&
        process.env.NODE_ENV !== 'test'
      ) {
        throw new Error(warnText);
      }
    }
    this._items.push(item);
  }

  unRegister(item: T): void {
    this._items = this._items.filter(
      it => it === item || item.identify !== it.identify,
    );
  }

  get(identify: Symbol | string) {
    console.log('TCL: get -> identify', identify);
    if (typeof identify === 'symbol') {
      return _.find(this._items, it => it.identify === identify);
    }
    return _.find(this._items, it => it.name === identify);
  }

  getAll(): T[] {
    return this._items;
  }
}
