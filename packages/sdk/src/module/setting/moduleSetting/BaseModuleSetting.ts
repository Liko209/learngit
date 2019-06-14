/*
 * @Author: Paynter Chen
 * @Date: 2019-05-24 12:18:14
 * Copyright © RingCentral. All rights reserved.
 */

import { IModuleSetting, SettingEntityIds, IUserSettingHandler } from './types';
import { UserSettingEntity } from '../entity';
import { Nullable } from 'sdk/types';
abstract class BaseModuleSetting<
  T extends Partial<Record<SettingEntityIds, IUserSettingHandler>>
> implements IModuleSetting {
  private _handlerMap?: T;

  protected abstract getHandlerMap(): T;

  init() {
    if (!this._handlerMap) {
      this._handlerMap = this.getHandlerMap();
    }
  }

  dispose() {
    if (this._handlerMap) {
      Object.entries(this._handlerMap).forEach(([, handler]) => {
        handler && handler.dispose();
      });
      delete this._handlerMap;
    }
  }

  async getById<T>(
    settingId: SettingEntityIds,
  ): Promise<Nullable<UserSettingEntity<T>>> {
    if (this._handlerMap && this._handlerMap[settingId]) {
      return await this._handlerMap[settingId]!.getUserSettingEntity();
    }
    return null;
  }
}

export { BaseModuleSetting };
