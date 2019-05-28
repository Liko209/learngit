/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-19 18:14:42
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action, computed, createAtom } from 'mobx';
import { SettingPage, SettingSection, SettingItem } from '@/interface/setting';
import { SettingStoreScope } from './SettingStoreScope';

function compareWeight<T extends { weight: number }>(left: T, right: T) {
  return left.weight - right.weight;
}

class SettingStore {
  // NOTE
  // We can not add @observable to _storeScopes because
  // mobx didn't support using symbol as key of a Map. As
  // a fallback solution, we have to use mobx atom api to
  // make _storeScopes observable.
  private _storeScopeAtom = createAtom('_storeScopes');
  // @observable by _storeScopeAtom
  private _storeScopes = new Map<symbol, SettingStoreScope>();
  @observable private _currentPageId: SettingPage['id'];

  @computed
  get currentPage() {
    return this.getPageById(this._currentPageId);
  }

  @computed
  get pages() {
    this._storeScopeAtom.reportObserved();
    const resultPages: SettingPage[] = [];
    this._storeScopes.forEach(store => {
      resultPages.push(...store.pages);
    });
    return resultPages.sort(compareWeight);
  }

  @computed
  get sections() {
    return this.pages
      .reduce((result: SettingSection[], page: SettingPage) => {
        return result.concat(page.sections);
      },      [])
      .sort(compareWeight);
  }

  @computed
  get items() {
    return this.sections
      .reduce((result: SettingItem[], section: SettingSection) => {
        return result.concat(section.items);
      },      [])
      .sort(compareWeight);
  }

  @action
  getPageById(pageId: string) {
    return this.pages.find(page => page.id === pageId);
  }

  @action
  getSectionById(sectionId: SettingSection['id']) {
    return this.sections.find(section => section.id === sectionId);
  }

  @action
  getItemById(itemId: SettingItem['id']) {
    return this.items.find(item => item.id === itemId);
  }

  @action
  useScope(scope: symbol) {
    let store = this._storeScopes.get(scope);
    if (!store) {
      store = new SettingStoreScope();
      this._storeScopeAtom.reportChanged();
      this._storeScopes.set(scope, store);
    }
    return store;
  }

  @action
  setCurrentPageId(pageId: SettingPage['id']) {
    this._currentPageId = pageId;
  }
}

export { SettingStore, SettingStoreScope };
