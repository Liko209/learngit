/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:38:10
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { container } from 'framework/ioc';
import { StoreViewModel } from '@/store/ViewModel';
import { SettingStore } from '../../store';
import { SettingPageProps, SettingPageViewProps } from './types';

class SettingPageViewModel extends StoreViewModel<SettingPageProps>
  implements SettingPageViewProps {
  get _settingStore(): SettingStore {
    return container.get(SettingStore);
  }

  @computed
  get page() {
    const val = this._settingStore.getPageById(this.props.id);
    if (!val) {
      throw Error(
        `[SettingPageViewComponent] trying to render a setting page without page ${
          this.props.id
        } info`,
      );
    }
    return val;
  }

  @computed
  get sectionIds() {
    if (!this.page) {
      return [];
    }
    return this._settingStore.getNoEmptyPageSections(this.props.id);
  }
}

export { SettingPageViewModel };
