/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:38:10
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { container } from 'framework';
import { StoreViewModel } from '@/store/ViewModel';
import { SettingStore } from '../../store';
import { SettingPageViewProps } from './types';

class SettingPageViewModel extends StoreViewModel
  implements SettingPageViewProps {
  get _settingStore(): SettingStore {
    return container.get(SettingStore);
  }

  @computed
  get page() {
    return this._settingStore.currentPage;
  }

  @computed
  get sectionIds() {
    if (!this.page) {
      return [];
    }
    return this._settingStore.getNoEmptyPageSections(this.page.id);
  }
}

export { SettingPageViewModel };
