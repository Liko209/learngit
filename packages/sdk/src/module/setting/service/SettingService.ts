/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-05 12:35:12
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractService } from 'sdk/framework';
import { SettingController } from '../controller/SettingController';
import { IModuleSetting } from '../types';

class SettingService extends AbstractService {
  private _settingController: SettingController;

  protected onStarted() {}

  protected onStopped() {
    if (this._settingController) {
      this._settingController.dispose();
      delete this._settingController;
    }
  }

  async getById(id: number) {
    return this.settingController.getById(id);
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
