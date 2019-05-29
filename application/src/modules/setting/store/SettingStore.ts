/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-19 18:14:42
 * Copyright © RingCentral. All rights reserved.
 */
import { uniq } from 'lodash';
import { observable, action, computed, createAtom } from 'mobx';
import { SettingPage, SettingSection, SettingItem } from '@/interface/setting';
import { SettingStoreScope } from './SettingStoreScope';
import { getSettingItemEntity } from './utils';
import { ESettingItemState } from 'sdk/src/framework/model/setting/types';

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
  // __storeScopes is @observable
  private _storeScopes_ = new Map<symbol, SettingStoreScope>();

  @computed
  private get _storeScopes() {
    this._storeScopeAtom.reportObserved();
    return this._storeScopes_;
  }

  @observable private _currentPageId: SettingPage['id'];

  @computed
  get currentPage() {
    return this.getPageById(this._currentPageId);
  }

  @action
  getNoEmptyPages() {
    return this.getAllPages().filter(
      pageId => this.getNoEmptyPageSections(pageId).length > 0,
    );
  }

  @action
  getAllPages() {
    const result: SettingPage['id'][] = [];
    this._storeScopes.forEach(storeScope => {
      result.push(...storeScope.pages.map(page => page.id));
    });
    return uniq(result);
  }

  @action
  getPageById(pageId: SettingPage['id']) {
    return this._find(storeScope => storeScope.getPageById(pageId));
  }

  @action
  getPageSections(pageId: SettingPage['id']) {
    return this._getAll(storeScope => storeScope.getPageSections(pageId));
  }

  @action
  getNoEmptyPageSections(pageId: SettingPage['id']) {
    return this.getPageSections(pageId).filter(pageId => {
      const itemIds = this.getSectionItems(pageId);
      return (
        itemIds.length > 0 &&
        itemIds.some(itemId => this._isItemVisible(itemId))
      );
    });
  }

  @action
  getSectionById(sectionId: SettingSection['id']) {
    return this._find(storeScope => storeScope.getSectionById(sectionId));
  }

  @action
  getSectionItems(sectionId: SettingSection['id']) {
    return this._getAll(storeScope => storeScope.getSectionItems(sectionId));
  }

  @action
  getPageItems(pageId: SettingPage['id']) {
    return this.getPageSections(pageId).reduce(
      (result: SettingItem['id'][], sectionId: SettingSection['id']) => {
        return result.concat(this.getSectionItems(sectionId));
      },
      [],
    );
  }

  @action
  getItemById(itemId: SettingItem['id']) {
    return this._find(storeScope => storeScope.getItemById(itemId));
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

  @action
  private _getAll<T>(callback: (storeScope: SettingStoreScope) => T[]) {
    const result: T[] = [];
    this._storeScopes.forEach(storeScope => {
      result.push(...callback(storeScope));
    });
    return uniq(result);
  }

  @action
  private _find<T>(
    callback: (storeScope: SettingStoreScope) => T,
  ): T | undefined {
    let result: T | undefined;
    for (const [, storeScope] of this._storeScopes) {
      result = callback(storeScope);
      if (result) {
        break;
      }
    }
    return result;
  }

  @action
  private _isItemVisible(id: SettingItem['id']) {
    return getSettingItemEntity(id).state !== ESettingItemState.INVISIBLE;
  }
}

export { SettingStore, SettingStoreScope, compareWeight };
