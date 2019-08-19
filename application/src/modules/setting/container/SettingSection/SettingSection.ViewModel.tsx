/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-29 17:23:11
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { container } from 'framework/ioc';
import { StoreViewModel } from '@/store/ViewModel';
import { SettingStore } from '../../store';
import { SettingSectionProps, SettingSectionViewProps } from './types';

class SettingSectionViewModel extends StoreViewModel<SettingSectionProps>
  implements SettingSectionViewProps {
  get _settingStore(): SettingStore {
    return container.get(SettingStore);
  }

  @computed
  get section() {
    return this._settingStore.getSectionById(this.props.sectionId);
  }

  @computed
  get itemIds() {
    return this._settingStore.getSectionVisibleItems(this.props.sectionId);
  }
}

export { SettingSectionViewModel };
