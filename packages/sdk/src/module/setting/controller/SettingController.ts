/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-06 11:02:49
 * Copyright © RingCentral. All rights reserved.
 */

import { IModuleSetting } from '../moduleSetting/types';

async function findFirst<R, T>(
  arr: R[],
  transform: (rawItem: R) => Promise<T>,
  filter: (it: T) => boolean,
): Promise<T | null> {
  for (let index = 0; index < arr.length; index++) {
    const element = arr[index];
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
    moduleSetting.init();
    this._moduleSettings.push(moduleSetting);
  }

  unRegisterModuleSetting(moduleSetting: IModuleSetting) {
    this._moduleSettings = this._moduleSettings.filter(
      it => it !== moduleSetting,
    );
    moduleSetting.dispose();
  }

  async getById(id: number) {
    return findFirst(
      this._moduleSettings,
      async provider => provider.getById(id),
      item => !!item,
    );
  }

  init() {
    this._moduleSettings.forEach(moduleSetting => moduleSetting.init());
  }

  dispose() {
    this._moduleSettings.forEach(moduleSetting => moduleSetting.dispose());
  }
}

export { SettingController };
