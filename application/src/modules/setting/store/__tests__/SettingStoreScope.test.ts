/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-19 18:53:26
 * Copyright © RingCentral. All rights reserved.
 */
import {
  SettingPage,
  SettingSection,
  SettingItem,
  SETTING_ITEM_TYPE,
} from '@/interface/setting';
import { SettingStoreScope } from '../SettingStore';
import { buildGeneralPageAndSection } from './helper';
import {
  SETTING_PAGE__GENERAL,
  SETTING_SECTION__GENERAL,
  SETTING_ITEM__1,
  SETTING_SECTION__1,
} from './constant';

function setupWithPage(page: SettingPage) {
  const store = new SettingStoreScope();
  store.addPage(page);
  return store;
}

describe('SettingStoreScope', () => {
  describe('addPage()', () => {
    it('should add a new page', () => {
      const page = buildGeneralPageAndSection();
      const store = new SettingStoreScope();
      store.addPage(page);
      expect(store.getPageById(SETTING_PAGE__GENERAL)).toEqual(page);
      expect(store.getPageSections(SETTING_PAGE__GENERAL)).toContain(
        SETTING_SECTION__GENERAL,
      );
    });
  });

  describe('addSection()', () => {
    it('should add a new section to the page', () => {
      const section: SettingSection = {
        id: SETTING_SECTION__1,
        title: 'setting.general',
        description: 'setting.generalDescription',
        weight: 0,
        items: [],
      };
      const store = setupWithPage(buildGeneralPageAndSection());
      store.addSection(SETTING_PAGE__GENERAL, section);

      expect(store.getSectionById(SETTING_SECTION__1)).toEqual(section);
      expect(store.getPageSections(SETTING_PAGE__GENERAL)).toContain(
        SETTING_SECTION__1,
      );
    });
  });

  describe('addItem()', () => {
    it('should add a new section to the page', () => {
      const item: SettingItem = {
        id: SETTING_ITEM__1,
        title: 'setting.testItem',
        description: 'setting.testItemDescription',
        type: SETTING_ITEM_TYPE.SELECT,
        weight: 0,
      };
      const store = setupWithPage(buildGeneralPageAndSection());
      store.addItem(SETTING_SECTION__GENERAL, item);

      expect(store.getItemById(SETTING_ITEM__1)).toEqual(item);
      expect(store.getSectionItems(SETTING_SECTION__GENERAL)).toContain(
        SETTING_ITEM__1,
      );
      expect(store.getPageItems(SETTING_PAGE__GENERAL)).toContain(
        SETTING_ITEM__1,
      );
    });
  });

  describe('clear()', () => {
    it('should clear the store', () => {
      const store = setupWithPage(buildGeneralPageAndSection());
      store.clear();
      expect(store.pages).toHaveLength(0);
      expect(store.sections).toHaveLength(0);
      expect(store.pages).toHaveLength(0);
    });
  });
});
