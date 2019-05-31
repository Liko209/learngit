/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-19 18:14:42
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed, observable } from 'mobx';
import { SettingPage, SettingSection, SettingItem } from '@/interface/setting';
import { RelationMap } from './relation/RelationMap';

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type StorePage = Omit<SettingPage, 'sections'>;
type StoreSection = Omit<SettingSection, 'items'>;

type PageMap = Map<SettingPage['id'], StorePage>;
type SectionMap = Map<SettingSection['id'], StoreSection>;
type ItemMap<T extends SettingItem = SettingItem> = Map<T['id'], T>;
type PageSection = RelationMap<SettingPage['id'], SettingSection['id']>;
type SectionItem = RelationMap<SettingSection['id'], SettingItem['id']>;

class SettingStoreScope {
  @observable
  private _pages: PageMap = new Map();
  @observable
  private _sections: SectionMap = new Map();
  @observable
  private _items: ItemMap = new Map();
  @observable
  private _pageSections: PageSection = new RelationMap();
  @observable
  private _sectionItems: SectionItem = new RelationMap();

  @computed
  get pages() {
    return [...this._pages.values()];
  }

  @computed
  get sections() {
    return [...this._sections.values()];
  }

  @computed
  get items() {
    return [...this._items.values()];
  }

  @action
  getPageById(pageId: SettingPage['id']) {
    return this._pages.get(pageId);
  }

  @action
  getPageSections(pageId: SettingPage['id']) {
    return this._pageSections.get(pageId);
  }

  @action
  getPageItems(pageId: SettingPage['id']) {
    return this.getPageSections(pageId).reduce(
      (result: SettingItem['id'][], sectionId) => {
        return result.concat(this.getSectionItems(sectionId));
      },
      [],
    );
  }

  @action
  getSectionById(sectionId: SettingSection['id']) {
    return this._sections.get(sectionId);
  }

  @action
  getSectionItems(sectionId: SettingSection['id']) {
    return this._sectionItems.get(sectionId);
  }

  @action
  getItemById<T extends SettingItem>(itemId: SettingItem['id']): T {
    return this._items.get(itemId) as T;
  }

  @action
  addPage(page: SettingPage) {
    this._pages.set(page.id, page);
    page.sections.forEach(section => this.addSection(page.id, section));
  }

  @action
  addSection(pageId: SettingPage['id'], section: SettingSection) {
    this._sections.set(section.id, section);
    this._pageSections.add(pageId, section.id);
    section.items.forEach(item => this.addItem(section.id, item));
  }

  @action
  addItem(sectionId: SettingSection['id'], item: SettingItem) {
    this._items.set(item.id, item);
    this._sectionItems.add(sectionId, item.id);
  }

  @action
  clear() {
    this._pages.clear();
    this._sections.clear();
    this._items.clear();
    this._pageSections.clear();
    this._sectionItems.clear();
  }
}

export { SettingStoreScope, StorePage, StoreSection };
