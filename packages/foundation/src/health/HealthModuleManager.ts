/*
 * @Author: Paynter Chen
 * @Date: 2019-06-09 12:27:26
 * Copyright © RingCentral. All rights reserved.
 */

import { RegisterItemManager } from './RegisterItemManager';
import { IHealthModule, IHealthModuleManager } from './types';

export class HealthModuleManager implements IHealthModuleManager {
  private static _instance: HealthModuleManager;
  private _manager: RegisterItemManager<IHealthModule>;

  private constructor() {
    this._manager = new RegisterItemManager('HealthModuleManager');
  }

  static getInstance() {
    if (!HealthModuleManager._instance) {
      HealthModuleManager._instance = new HealthModuleManager();
    }
    return HealthModuleManager._instance;
  }

  register(item: IHealthModule): void {
    return this._manager.register(item);
  }

  unRegister(item: IHealthModule): void {
    return this._manager.unRegister(item);
  }

  get(identify: string | Symbol): IHealthModule | undefined {
    return this._manager.get(identify);
  }

  getAll(): IHealthModule[] {
    return this._manager.getAll();
  }
}
