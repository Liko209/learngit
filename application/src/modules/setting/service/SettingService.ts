/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-19 18:23:21
 * Copyright © RingCentral. All rights reserved.
 */
import { inject } from 'framework/ioc';
import { mainLogger } from 'foundation/log';
import {
  ISettingService,
  SettingPage,
  SettingSection,
  SettingItem,
} from '@/interface/setting';
import history from '@/history';
import { SettingStore } from '../store';
import { SETTING_ROUTE_ROOT } from '../constant';

class SettingService implements ISettingService {
  @inject(SettingStore) private _settingStore: SettingStore;

  registerPage(scope: symbol, page: SettingPage): void {
    this._settingStore.useScope(scope).addPage(page);
  }

  registerSection(
    scope: symbol,
    pageId: SettingPage['id'],
    section: SettingSection,
  ): void {
    this._settingStore.useScope(scope).addSection(pageId, section);
  }

  registerItem(
    scope: symbol,
    sectionId: SettingSection['id'],
    item: SettingItem,
  ): void {
    this._settingStore.useScope(scope).addItem(sectionId, item);
  }

  unRegisterAll(scope: symbol): void {
    this._settingStore.useScope(scope).clear();
  }

  goToSettingPage(pageId: SettingPage['id'], { replace = false } = {}) {
    const page = this._settingStore.getPageById(pageId);

    if (!page) {
      mainLogger.error('Trying to open a non-existed setting page');
      return;
    }

    const path = `${SETTING_ROUTE_ROOT}${page.path}`;

    if (replace) {
      history.replace(path);
    } else {
      history.push(path);
    }

    this._settingStore.setCurrentPageId(pageId);
  }
}

export { SettingService };
