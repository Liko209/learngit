/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-19 18:14:42
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action, computed } from 'mobx';
import { SettingPage, SettingSection, SettingItem } from '@/interface/setting';

class SettingStoreScope {
  @observable
  pages: SettingPage[] = [];

  @computed
  get sections() {
    return this._getSectionsInPages(this.pages);
  }

  @action
  getPageById(pageId: string) {
    return this.pages.find(page => page.id === pageId);
  }

  @action
  getSectionsByPageId(pageId: string) {
    return this._getSectionsInPages(
      this.pages.filter(page => page.id === pageId),
    );
  }

  @action
  getItemsBySectionId(sectionId: string) {
    return this.sections
      .filter(section => section.id === sectionId)
      .reduce((result: SettingItem[], section: SettingSection) => {
        return result.concat(section.items);
      },      []);
  }

  @action
  addPage(page: SettingPage) {
    this.pages.push(page);
  }

  @action
  addSection(pageId: string, section: SettingSection) {
    const page = this.pages.find(page => page.id === pageId);
    if (page) {
      page.sections.push(section);
    }
  }

  @action
  addItem(sectionId: string, item: SettingItem) {
    let section: SettingSection | undefined = undefined;
    for (const page of this.pages) {
      section = page.sections.find(section => section.id === sectionId);
      if (section) {
        break;
      }
    }
    if (section) {
      section.items.push(item);
    }
  }

  @action
  clear() {
    this.pages = [];
  }

  private _getSectionsInPages(pages: SettingPage[]) {
    return pages.reduce((result: SettingSection[], page: SettingPage) => {
      return result.concat(page.sections);
    },                  []);
  }
}

export { SettingStoreScope };
