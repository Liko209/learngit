/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:38:10
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { container } from 'framework';
import { StoreViewModel } from '@/store/ViewModel';
import { SettingSection } from '@/interface/setting';
import { SettingStore, emptySectionFilter, compareWeight } from '../../store';

class SettingPageViewModel extends StoreViewModel {
  get _settingStore(): SettingStore {
    return container.get(SettingStore);
  }

  @computed
  get page() {
    return this._settingStore.currentPage;
  }

  @computed
  get sections() {
    let result: SettingSection[] = [];
    if (this.page) {
      result = this.page.sections;
    }
    return result.filter(emptySectionFilter).sort(compareWeight);
  }
}

export { SettingPageViewModel };
