/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-06 11:02:49
 * Copyright © RingCentral. All rights reserved.
 */

import { ServiceLoader } from '../../serviceLoader';
import { IUserModuleSetting } from '../ModuleSettings';
import { EntityBaseService } from 'sdk/framework';
import {
  SettingId2Service,
  ModuleSettingClass,
  SupportSettingServices,
} from './constants';
import { IdModel } from 'sdk/framework/model';
import { UserSettingEntity } from '../entity';

class SettingController {
  private _moduleSettings: Map<number, IUserModuleSetting> = new Map();
  constructor() {
    for (const iterator of ModuleSettingClass) {
      const obj = new iterator();
      this._moduleSettings.set(obj.id(), obj);
    }
  }

  async getModuleSettings() {
    const promises = [];
    for (const iterator of this._moduleSettings) {
      promises.push(iterator[1].buildSettingItem());
    }
    return (await Promise.all(promises)) as UserSettingEntity<any>[];
  }

  async getById(id: number) {
    if (this._moduleSettings.has(id)) {
      return this._moduleSettings.get(id)!.buildSettingItem();
    }

    const serviceConfig = SettingId2Service[id];
    const service =
      (serviceConfig &&
        ServiceLoader.getInstance<EntityBaseService<IdModel>>(serviceConfig)) ||
      undefined;

    return service ? await service.getSettingItemById(id) : undefined;
  }

  async getSettingsByParentId(id: number): Promise<UserSettingEntity<any>[]> {
    const sections = this._getSettingSections(id);
    const settings = await Promise.all(
      sections.map((value: UserSettingEntity<any>) => {
        return this._getUserSettingsByParentId(value.id);
      }),
    );
    return [].concat.apply([], settings).concat(sections);
  }

  private _getSettingSections(moduleId: number) {
    const settingModule = this._moduleSettings.get(moduleId);
    const fc = settingModule && settingModule.getSections;
    return (fc && fc()) || ([] as UserSettingEntity<any>[]);
  }

  private async _getUserSettingsByParentId(id: number) {
    const settings = SupportSettingServices.map(name => {
      const service = ServiceLoader.getInstance<EntityBaseService<IdModel>>(
        name,
      );
      return (
        (service.getSettingsByParentId && service.getSettingsByParentId(id)) ||
        []
      );
    });
    const allSettings = await Promise.all(settings);
    return [].concat.apply([], allSettings) as UserSettingEntity<any>[];
  }

  dispose() {
    this._moduleSettings.forEach(value => {
      value.dispose && value.dispose();
    });
  }
}

export { SettingController };
