/*
 * @Author: Paynter Chen
 * @Date: 2019-06-09 12:27:26
 * Copyright © RingCentral. All rights reserved.
 */

import { IHealthStatusItem, IHealthModule } from './types';
import { RegisterItemManager } from './RegisterItemManager';
export class BaseHealthModule implements IHealthModule {
  private _manager: RegisterItemManager<IHealthStatusItem>;

  constructor(public readonly identify: Symbol, public readonly name: string) {
    this._manager = new RegisterItemManager(name);
  }

  register(item: IHealthStatusItem): void {
    return this._manager.register(item);
  }

  unRegister(item: IHealthStatusItem): void {
    return this._manager.unRegister(item);
  }

  get(identify: string | Symbol): IHealthStatusItem | undefined {
    return this._manager.get(identify);
  }

  getAll(): IHealthStatusItem[] {
    return this._manager.getAll();
  }
}
