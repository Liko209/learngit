/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-02 10:29:39
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { action, computed, observable } from 'mobx';
import { SettingContainerProps } from './types';
import { SETTING_LIST_TYPE } from '../../SettingLeftRail/types';
import {
  ESettingValueType,
  UserSettingEntity,
} from 'sdk/module/setting/entity';
import SettingModel from '@/store/models/UserSetting';
import { ENTITY_NAME } from '@/store';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { getEntity } from '@/store/utils';
import { FetchSortableDataListHandler } from '@/store/base/fetch';
import { SettingItemFocBuilder } from '../SettingItemFocBuilder';
import { catchError } from '@/common/catchError';
import { QUERY_DIRECTION } from 'sdk/dao';

type listStoreType = {
  height: number;
};

class SettingContainerViewModel extends StoreViewModel<SettingContainerProps> {
  static settingListStore: Map<string, object> = new Map();
  @observable
  private _settingItemListHandle: FetchSortableDataListHandler<
    UserSettingEntity
  >;

  constructor() {
    super();
    this.reaction(
      () => this.props.leftRailItemId,
      async (currentLeftRailId: number) => {
        this._settingItemListHandle && this._settingItemListHandle.dispose();
        this._settingItemListHandle = new SettingItemFocBuilder().buildSettingItemFoc(
          currentLeftRailId,
        );
        this._settingItemListHandle.fetchData(QUERY_DIRECTION.NEWER);
      },
      {
        fireImmediately: true,
      },
    );
  }

  @action
  getCurrentTypeScrollHeight = (type: SETTING_LIST_TYPE) => {
    const listStore = SettingContainerViewModel.settingListStore;
    if (listStore.has(type)) {
      const { height } = listStore.get(type) as listStoreType;
      return height;
    }
    return 0;
  }

  @computed
  get settingItemData() {
    if (!this._settingItemListHandle) return { sortSection: [], sortItem: {} };
    const itemIds = this._settingItemListHandle.sortableListStore.getIds;
    const sortSection: number[] = [];
    const sortItem = {};
    itemIds.forEach(id => {
      const item = this.getItem(id);
      const { state, valueType, parentModelId } = item;
      if (state === ESettingItemState.INVISIBLE) return;
      if (ESettingValueType['SECTION'] === valueType) {
        sortSection.push(id);
      } else {
        if (!parentModelId) return;
        if (!sortItem[parentModelId]) {
          sortItem[parentModelId] = [item];
          return;
        }
        sortItem[parentModelId].push(item);
      }
    });
    return { sortSection, sortItem };
  }

  getItem = (id: number) => {
    return getEntity<UserSettingEntity, SettingModel>(
      ENTITY_NAME.USER_SETTING,
      id,
    );
  }

  @action
  setCurrentTypeScrollHeight = (type: SETTING_LIST_TYPE, height: number) => {
    const listStore = SettingContainerViewModel.settingListStore;
    listStore.set(type, {
      height,
    });
  }

  @catchError.flash({
    network: 'setting.phone.general.callerID.errorText',
    server: 'setting.phone.general.callerID.errorText',
  })
  setNewValue = async <T>(
    newValue: T,
    valueSetter: (value: T) => Promise<void> | void,
  ) => {
    valueSetter && (await valueSetter(newValue));
  }

  handleItemChange = (valueSetter: (value: any) => Promise<void> | void) => <T>(
    newValue: T,
  ) => this.setNewValue<T>(newValue, valueSetter)
}

export { SettingContainerViewModel };
