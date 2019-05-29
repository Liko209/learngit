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

const SETTING_PAGE__GENERAL = 'SETTING_PAGE.GENERAL';
const SETTING_SECTION__GENERAL = 'SETTING_SECTION.GENERAL';
const SETTING_ITEM__TEST = 0;

function getGeneralPage() {
  return {
    id: SETTING_PAGE__GENERAL,
    title: 'setting.general',
    path: 'general',
    weight: 0,
    sections: [
      {
        id: SETTING_SECTION__GENERAL,
        title: 'setting.general',
        weight: 0,
        items: [],
      },
    ],
  };
}

function setupWithPage(page: SettingPage) {
  const store = new SettingStoreScope();
  store.pages.push(page);
  return store;
}

describe('SettingStoreScope', () => {
  describe('addPage()', () => {
    it('should add a new page', () => {
      const page = getGeneralPage();
      const store = new SettingStoreScope();
      store.addPage(page);
      expect(store.getPageById(SETTING_PAGE__GENERAL)).toEqual(page);
    });
  });

  describe('addSection()', () => {
    it('should add a new section to the page', () => {
      const section: SettingSection = {
        id: SETTING_SECTION__GENERAL,
        title: 'setting.general',
        description: 'setting.generalDescription',
        weight: 0,
        items: [],
      };
      const store = setupWithPage(getGeneralPage());
      store.addSection(SETTING_PAGE__GENERAL, section);

      expect(store.getSectionsByPageId(SETTING_PAGE__GENERAL)).toContainEqual(
        section,
      );
    });
  });

  describe('addItem()', () => {
    it('should add a new section to the page', () => {
      const item: SettingItem = {
        id: SETTING_ITEM__TEST,
        title: 'setting.testItem',
        description: 'setting.testItemDescription',
        type: SETTING_ITEM_TYPE.SELECT,
        weight: 0,
      };
      const store = setupWithPage(getGeneralPage());
      store.addItem(SETTING_SECTION__GENERAL, item);
      expect(
        store.getItemsBySectionId(SETTING_SECTION__GENERAL),
      ).toContainEqual(item);
    });
  });
});
