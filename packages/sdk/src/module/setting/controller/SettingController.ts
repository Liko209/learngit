/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-06 11:02:49
 * Copyright © RingCentral. All rights reserved.
 */

import { IModuleSetting } from '../types';

async function findFirst<R, T>(
  arr: R[],
  transform: (rawItem: R) => Promise<T>,
  filter: (it: T) => boolean,
): Promise<T | null> {
  for (let index = 0; index < arr.length; index++) {
    const element = arr[index];
    // filter(element);
    const transformElement = await transform(element);
    if (filter(transformElement)) {
      return transformElement;
    }
  }
  return null;
}

class SettingController {
  private _moduleSettings: IModuleSetting[] = [];

  registerModuleSetting(moduleSetting: IModuleSetting) {
    this._moduleSettings.push(moduleSetting);
  }

  unRegisterModuleSetting(moduleSetting: IModuleSetting) {
    this._moduleSettings = this._moduleSettings.filter(
      it => it === moduleSetting,
    );
  }

  async getById(id: number) {
    return findFirst(
      this._moduleSettings,
      async provider => provider.getById(id),
      item => !!item,
    );
  }

  dispose() {}
}

export { SettingController };
