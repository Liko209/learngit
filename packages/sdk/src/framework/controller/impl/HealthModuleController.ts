/*
 * @Author: Paynter Chen
 * @Date: 2019-06-09 13:28:52
 * Copyright © RingCentral. All rights reserved.
 */

import { IHealthModuleController } from '../interface/IHealthModuleController';
import {
  IHealthModule,
  HealthModuleManager,
  BaseHealthModule,
} from 'foundation/health';
import _ from 'lodash';

class HealthModuleController implements IHealthModuleController {
  private _module: IHealthModule;
  constructor(
    private _identify: Symbol,
    private _name: string,
    private _itemMap: { [key: string]: () => any | Promise<any> },
  ) {
    this._module = new BaseHealthModule(this._identify, this._name);
    _.each(this._itemMap, (value, key) => {
      this._module.register({
        name: key,
        getStatus: value,
      });
    });
  }

  init() {
    HealthModuleManager.getInstance().register(this._module);
  }

  dispose() {
    HealthModuleManager.getInstance().unRegister(this._module);
  }
}

export { HealthModuleController };
