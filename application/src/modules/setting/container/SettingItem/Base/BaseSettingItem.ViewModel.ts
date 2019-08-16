/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:38:10
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { container } from 'framework/ioc';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { UserSettingEntity } from 'sdk/module/setting';
import { SettingItem } from '@/interface/setting';
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity } from '@/store/utils';
import SettingModel from '@/store/models/UserSetting';
import { ENTITY_NAME } from '@/store/constants';
import { SettingStore } from '../../../store';
import { SettingItemProps } from '../types';

class BaseSettingItemViewModel<
  T extends SettingItemProps,
  K extends SettingItem = SettingItem
> extends StoreViewModel<T> {
  private get _settingStore(): SettingStore {
    return container.get(SettingStore);
  }

  @computed
  get disabled() {
    return this.settingItemEntity.state === ESettingItemState.DISABLE;
  }

  @computed
  get settingItem(): K {
    const item = this._settingStore.getItemById<K>(this.props.id);
    if (!item) {
      throw new Error(`ERROR: setting item not found. id: ${this.props.id}`);
    }
    return item;
  }

  @computed
  get settingItemEntity() {
    return getEntity<UserSettingEntity, SettingModel>(
      ENTITY_NAME.USER_SETTING,
      this.props.id,
    );
  }
}

export { BaseSettingItemViewModel };
