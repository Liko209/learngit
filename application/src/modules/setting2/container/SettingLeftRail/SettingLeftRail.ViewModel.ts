/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:38:10
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, action } from 'mobx';
import { jupiter } from 'framework';
import { StoreViewModel } from '@/store/ViewModel';
import { ISettingService } from '@/interface/setting';
import { SettingStore, emptyPageFilter } from '@/modules/setting2/store';

class SettingLeftRailViewModel extends StoreViewModel {
  private get _settingStore(): SettingStore {
    return jupiter.get(SettingStore);
  }

  private get _settingService(): ISettingService {
    return jupiter.get(ISettingService);
  }

  @computed
  get pages() {
    return this._settingStore.pages.filter(emptyPageFilter);
  }

  @computed
  get currentPage() {
    return this._settingStore.currentPage;
  }

  @action
  goToSettingPage = (pageId: string) => {
    this._settingService.goToSettingPage(pageId);
  }
}

export { SettingLeftRailViewModel };
