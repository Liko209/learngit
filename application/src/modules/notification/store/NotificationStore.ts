/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
export class NotificationStore<T> {
  private _items: object = {};
  keyMap(scope: string, id: number) {
    return `${scope}.${id}`;
  }

  get(scope: string, id: number) {
    const key = this.keyMap(scope, id);
    return this.items[key];
  }
  add(scope: string, id: number, disposers: T[]) {
    const key = this.keyMap(scope, id);
    this._items[key] = disposers;
  }
  remove(scope: string, id: number) {
    const key = this.keyMap(scope, id);
    delete this._items[key];
  }

  get items() {
    return this._items;
  }
}
