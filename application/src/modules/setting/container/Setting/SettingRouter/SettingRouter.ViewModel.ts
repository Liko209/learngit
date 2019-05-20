/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-03 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, action, observable } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import SettingModel from '@/store/models/UserSetting';
import { SettingItemFocBuilder } from '../SettingItemFocBuilder';
import { QUERY_DIRECTION } from 'sdk/dao';
import { UserSettingEntity } from 'sdk/module/setting/entity';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { ESettingItemState } from 'sdk/framework/model/setting';

class SettingRouterViewModel extends StoreViewModel {
  private _settingLeftRailListHandle: any;
  @observable
  currentLeftRailId: number;
  @observable
  leftRailItem: SettingModel[];
  constructor() {
    super();
    this._settingLeftRailListHandle = new SettingItemFocBuilder().buildLeftRailFoc();
    this._settingLeftRailListHandle.fetchData(QUERY_DIRECTION.NEWER);
  }

  @computed
  get leftRailItemIds() {
    const ids = this._settingLeftRailListHandle.sortableListStore.getIds;
    return ids.filter((id: number) => {
      const { state } = this.getItem(id);
      return state !== ESettingItemState.INVISIBLE;
    });
  }

  getItem = (id: number) => {
    return getEntity<UserSettingEntity, SettingModel>(
      ENTITY_NAME.USER_SETTING,
      id,
    );
  }

  @action
  updateCurrentLeftRailId = (id: number) => {
    this.currentLeftRailId = id;
  }
}

export { SettingRouterViewModel };
