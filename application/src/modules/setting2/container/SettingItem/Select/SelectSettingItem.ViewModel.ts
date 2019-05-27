/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:38:10
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { container } from 'framework';
import { UserSettingEntity } from 'sdk/module/setting';
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity } from '@/store/utils';
import SettingModel from '@/store/models/UserSetting';
import { ENTITY_NAME } from '@/store/constants';
import { SettingStore } from '../../../store';
import { SelectSettingItemProps } from './types';

class SelectSettingItemViewModel extends StoreViewModel<
  SelectSettingItemProps
> {
  get _settingStore(): SettingStore {
    return container.get(SettingStore);
  }

  @computed
  get settingItem() {
    return this._settingStore.getItemById(this.props.id);
  }

  @computed
  get settingItemEntity() {
    return getEntity<UserSettingEntity, SettingModel>(
      ENTITY_NAME.USER_SETTING,
      this.props.id,
    );
  }
}

export { SelectSettingItemViewModel };
