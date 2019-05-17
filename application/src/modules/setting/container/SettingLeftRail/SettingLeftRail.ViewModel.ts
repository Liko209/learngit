/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-02 10:29:39
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { computed, observable } from 'mobx';
import { SETTING_LIST_TYPE, SettingLeftRailProps } from './types';
import { GLOBAL_KEYS } from '@/store/constants';
import storeManager from '@/store';
import { getGlobalValue } from '@/store/utils';

class SettingLeftRailViewModel extends StoreViewModel {
  @observable
  private _type: SETTING_LIST_TYPE;

  @computed
  get currentSettingListType() {
    return (
      getGlobalValue(GLOBAL_KEYS.CURRENT_SETTING_LIST_TYPE) ||
      SETTING_LIST_TYPE.GENERAL
    );
  }

  onReceiveProps(props: SettingLeftRailProps) {
    if (
      Object.values(SETTING_LIST_TYPE).includes(props.type) &&
      this._type !== props.type
    ) {
      this._type = props.type;
      this._updateCurrentSettingListValue();
    }
  }

  private _updateCurrentSettingListValue() {
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(GLOBAL_KEYS.CURRENT_SETTING_LIST_TYPE, this._type);
  }
}

export { SettingLeftRailViewModel };
