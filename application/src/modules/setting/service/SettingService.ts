/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-04-23 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import { inject } from 'framework';
import { SettingStore } from '../store';
import { SettingItemType } from '../type';
import { ISettingService } from '../interface';

class SettingService implements ISettingService {
  @inject(SettingStore) private _SettingStore: SettingStore;

  registerSettingItem(item: SettingItemType) {
    this._SettingStore.addSettingItem(item);
  }

  unRegisterSettingItem(key: string) {
    this._SettingStore.removeSettingItem(key);
  }
}

export { SettingService };
