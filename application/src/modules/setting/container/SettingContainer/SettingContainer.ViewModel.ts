/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-02 10:29:39
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { action } from 'mobx';
import { SettingContainerProps } from './types';
import { SETTING_LIST_TYPE } from '../SettingLeftRail/types';

type listStoreType = {
  height: number;
};

class SettingContainerViewModel extends StoreViewModel<SettingContainerProps> {
  static settingListStore: Map<string, object> = new Map();

  @action
  getCurrentTypeScrollHeight = (type: SETTING_LIST_TYPE) => {
    const listStore = SettingContainerViewModel.settingListStore;
    if (listStore.has(type)) {
      const { height } = listStore.get(type) as listStoreType;
      return height;
    }
    return 0;
  }

  @action
  setCurrentTypeScrollHeight = (type: SETTING_LIST_TYPE, height: number) => {
    const listStore = SettingContainerViewModel.settingListStore;
    listStore.set(type, {
      height,
    });
  }
}

export { SettingContainerViewModel };
