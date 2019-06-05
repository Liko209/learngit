/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-19 18:14:42
 * Copyright © RingCentral. All rights reserved.
 */
import { uniq } from 'lodash';
import { observable, action, computed, createAtom } from 'mobx';
import { ESettingItemState } from 'sdk/framework/model/setting/types';
import { SettingPage, SettingSection, SettingItem } from '@/interface/setting';
import { SettingStoreScope } from './SettingStoreScope';
import { getSettingItemEntity } from './utils';

class SettingStore {
  // NOTE
  // We can not add @observable to _storeScopes because
  // mobx didn't support using symbol as key of a Map. As
  // a fallback solution, we have to use mobx atom api to
  // make _storeScopes observable.
  private _storeScopeAtom = createAtom('_storeScopes');
  // __storeScopes is @observable
  private _storeScopes_ = new Map<symbol, SettingStoreScope>();

  private get _storeScopes() {
    this._storeScopeAtom.reportObserved();
    return this._storeScopes_;
  }

  @observable private _currentPageId: SettingPage['id'] = '';

  @computed
  get currentPage() {
    return this.getPageById(this._currentPageId);
  }

  getNoEmptyPages() {
    return this.getAllPages().filter(
      pageId => this.getNoEmptyPageSections(pageId).length > 0,
    );
  }

  getAllPages() {
    const pagesIds: SettingPage['id'][] = [];
    this._storeScopes.forEach(storeScope => {
      pagesIds.push(...storeScope.pages.map(page => page.id));
    });
    return uniq(pagesIds).sort(this._comparePageWeight);
  }

  getPageById(pageId: SettingPage['id']) {
    return this._find(storeScope => storeScope.getPageById(pageId));
  }

  getPageSections(pageId: SettingPage['id']) {
    return this._getAll(storeScope => storeScope.getPageSections(pageId)).sort(
      this._compareSectionWeight,
    );
  }

  getNoEmptyPageSections(pageId: SettingPage['id']) {
    return this.getPageSections(pageId).filter(sectionId => {
      const itemIds = this.getSectionItems(sectionId);
      return (
        itemIds.length > 0 &&
        itemIds.some(itemId => this._isItemVisible(itemId))
      );
    });
  }

  getSectionById(sectionId: SettingSection['id']) {
    return this._find(storeScope => storeScope.getSectionById(sectionId));
  }

  getSectionItems(sectionId: SettingSection['id']) {
    return this._getAll(storeScope =>
      storeScope.getSectionItems(sectionId),
    ).sort(this._compareItemWeight);
  }

  getPageItems(pageId: SettingPage['id']) {
    return this.getPageSections(pageId).reduce(
      (result: SettingItem['id'][], sectionId: SettingSection['id']) => {
        return result.concat(this.getSectionItems(sectionId));
      },
      [],
    );
  }

  getItemById(itemId: SettingItem['id']) {
    return this._find(storeScope => storeScope.getItemById(itemId));
  }

  useScope(scope: symbol) {
    let store = this._storeScopes.get(scope);
    if (!store) {
      store = new SettingStoreScope();
      this._storeScopes.set(scope, store);
      this._storeScopeAtom.reportChanged();
    }
    return store;
  }

  @action
  setCurrentPageId(pageId: SettingPage['id']) {
    this._currentPageId = pageId;
  }

  private _getAll<T>(callback: (storeScope: SettingStoreScope) => T[]) {
    const result: T[] = [];
    this._storeScopes.forEach(storeScope => {
      result.push(...callback(storeScope));
    });
    return uniq(result);
  }

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

  private _isItemVisible(id: SettingItem['id']) {
    return getSettingItemEntity(id).state !== ESettingItemState.INVISIBLE;
  }

  private _comparePageWeight = (
    leftId: SettingPage['id'],
    rightId: SettingPage['id'],
  ) => {
    return this.getPageById(leftId)!.weight - this.getPageById(rightId)!.weight;
  }

  private _compareSectionWeight = (
    leftId: SettingSection['id'],
    rightId: SettingSection['id'],
  ) => {
    return (
      this.getSectionById(leftId)!.weight - this.getSectionById(rightId)!.weight
    );
  }

  private _compareItemWeight = (
    leftId: SettingItem['id'],
    rightId: SettingItem['id'],
  ) => {
    return this.getItemById(leftId)!.weight - this.getItemById(rightId)!.weight;
  }
}

export { SettingStore, SettingStoreScope };
