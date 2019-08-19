/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-05 12:35:12
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractService } from 'sdk/framework';
import { SettingController } from '../controller/SettingController';
import { IModuleSetting } from '../moduleSetting/types';
import { UserSettingEntity, ConversationPreferenceModel } from '../entity';
import { Nullable } from 'sdk/types';

class SettingService extends AbstractService {
  private _settingController: SettingController;

  protected onStarted() {
    this._settingController && this._settingController.init();
  }

  protected onStopped() {
    this._settingController && this._settingController.dispose();
  }

  async getById<T>(id: number): Promise<Nullable<UserSettingEntity<T>>> {
    return await this.settingController.getById<T>(id);
  }

  async getByGroupId(id: number): Promise<ConversationPreferenceModel> {
    // todo
    return {} as ConversationPreferenceModel;
  }

  async updateConversationPreference(
    id: number,
    model: Partial<ConversationPreferenceModel>,
  ): Promise<void> {
    // todo
    console.log(id, model);
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
