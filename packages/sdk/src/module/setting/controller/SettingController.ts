/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-06 11:02:49
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';

import { UserSettingEntity } from '../entity';
import { IModuleSetting } from '../moduleSetting/types';
import { Nullable } from 'sdk/types';

type SettingItemRequest<T> = {
  id: number;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason: any) => void;
};

class SettingController {
  private _moduleSettings: IModuleSetting[] = [];
  private _requestPool: SettingItemRequest<UserSettingEntity>[] = [];

  registerModuleSetting(moduleSetting: IModuleSetting) {
    moduleSetting.init();
    this._moduleSettings.push(moduleSetting);
    const requestsCanBeHandled = this._requestPool.filter(r =>
      moduleSetting.has(r.id),
    );
    this._requestPool = this._requestPool.filter(r => !moduleSetting.has(r.id));

    requestsCanBeHandled.map(r =>
      moduleSetting.getById(r.id).then(result => {
        result ? r.resolve(result) : r.reject(result);
      }),
    );
  }

  unRegisterModuleSetting(moduleSetting: IModuleSetting) {
    this._moduleSettings = this._moduleSettings.filter(
      it => it !== moduleSetting,
    );
    moduleSetting.dispose();
  }

  async getById<T>(id: number): Promise<Nullable<UserSettingEntity<T>>> {
    const moduleSetting = _.find(this._moduleSettings, it => it.has(id));
    if (moduleSetting) {
      return await moduleSetting.getById(id);
    }
    return new Promise((resolve, reject) => {
      this._requestPool.push({
        id,
        resolve,
        reject,
      });
    });
  }

  init() {
    this._moduleSettings.forEach(moduleSetting => moduleSetting.init());
  }

  dispose() {
    this._moduleSettings.forEach(moduleSetting => moduleSetting.dispose());
  }
}

export { SettingController };
