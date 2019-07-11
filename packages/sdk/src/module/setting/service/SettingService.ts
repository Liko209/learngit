/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-05 12:35:12
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractService } from 'sdk/framework';
import { SettingController } from '../controller/SettingController';
import { IModuleSetting } from '../moduleSetting/types';
import { UserSettingEntity } from '../entity';
import { Nullable } from 'sdk/types';

class SettingService extends AbstractService {
  private _settingController: SettingController;

  protected onStarted() {
    this._settingController && this._settingController.init();
  }

  protected onStopped() {
    this._settingController && this._settingController.dispose();
  }

  async getById<T>(id: number, internal?: number): Promise<Nullable<UserSettingEntity<T>>> {
    const promise = this.settingController.getById<T>(id);
    if (internal !== undefined) {
      const internalPromise = new Promise<null>(resolve => setTimeout(() => resolve(null), internal));
      return Promise.race([promise, internalPromise]);
    }
    return promise;
  }

  registerModuleSetting(moduleSetting: IModuleSetting) {
    this.settingController.registerModuleSetting(moduleSetting);
  }

  unRegisterModuleSetting(moduleSetting: IModuleSetting) {
    this.settingController.unRegisterModuleSetting(moduleSetting);
  }

  private get settingController() {
    if (!this._settingController) {
      this._settingController = new SettingController();
    }
    return this._settingController;
  }
}

export { SettingService };
