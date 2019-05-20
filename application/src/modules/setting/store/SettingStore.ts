/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-04-23 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import { observable } from 'mobx';
import { SettingItemType } from '../type';

class SettingStore {
  @observable _settingItems: SettingItemType;

  getSettingItem(key: string) {
    return this._settingItems[key];
  }
  addSettingItem(item: SettingItemType) {
    this._settingItems = { ...this._settingItems, ...item };
  }
  removeSettingItem(key: string) {
    delete this._settingItems[key];
  }

  get SettingItems() {
    return this._settingItems;
  }
}

export { SettingStore };
