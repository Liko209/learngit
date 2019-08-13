/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-30 09:18:16
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { jupiter } from 'framework/Jupiter';
import { ISettingService, SETTING_ITEM_TYPE } from '@/interface/setting';
import history from '@/history';
import { config } from '../../module.config';
import { SettingStore } from '../../store';
import { SETTING_ROUTE_ROOT } from '../../constant';

jest.mock('@/history');

jupiter.registerModule(config);
const SCOPE_1 = Symbol('SCOPE_1');
const SCOPE_2 = Symbol('SCOPE_2');

function setup() {
  container.snapshot();
  const settingStore: SettingStore = jupiter.get(SettingStore);
  const settingService: ISettingService = jupiter.get(ISettingService);
  return { settingStore, settingService };
}

describe('SettingService', () => {
  beforeEach(() => {
    container.snapshot();
  });
  afterEach(() => {
    container.restore();
  });

  describe('registerPage()', () => {
    it('should register a page', () => {
      const { settingService, settingStore } = setup();

      settingService.registerPage(SCOPE_1, {
        id: 'PAGE_1',
        title: 'Page 1',
        path: '/page_1',
        weight: 0,
        sections: [],
      });

      expect(settingStore.getAllPages()).toContain('PAGE_1');
      expect(settingStore.useScope(SCOPE_1).pages[0].id).toBe('PAGE_1');
    });
  });

  describe('registerSection()', () => {
    it('should register a section', () => {
      const { settingService, settingStore } = setup();

      settingService.registerSection(SCOPE_1, 'PAGE_1', {
        id: 'SECTION_1',
        title: 'Section 1',
        weight: 0,
        items: [],
      });

      expect(settingStore.getPageSections('PAGE_1')).toContain('SECTION_1');
      expect(
        settingStore.useScope(SCOPE_1).getPageSections('PAGE_1'),
      ).toContain('SECTION_1');
    });
  });

  describe('registerItem()', () => {
    it('should register a item', () => {
      const { settingService, settingStore } = setup();

      settingService.registerItem(SCOPE_1, 'SECTION_1', {
        id: 1,
        title: 'Item 1',
        weight: 0,
        type: SETTING_ITEM_TYPE.SELECT,
      });

      expect(settingStore.getSectionItems('SECTION_1')).toContain(1);
      expect(
        settingStore.useScope(SCOPE_1).getSectionItems('SECTION_1'),
      ).toContain(1);
    });
  });

  describe('unRegisterAll()', () => {
    it('should un-register all in the scope', () => {
      const { settingService, settingStore } = setup();

      settingService.registerPage(SCOPE_1, {
        id: 'PAGE_1',
        title: 'Page 1',
        path: '/page_1',
        weight: 0,
        sections: [
          {
            id: 'SECTION_1',
            title: 'Section 1',
            weight: 0,
            items: [
              {
                id: 1,
                title: 'Item 1',
                weight: 0,
                type: SETTING_ITEM_TYPE.SELECT,
              },
            ],
          },
        ],
      });

      settingService.registerPage(SCOPE_2, {
        id: 'PAGE_2',
        title: 'Page 2',
        path: '/page_2',
        weight: 100,
        sections: [
          {
            id: 'SECTION_2',
            title: 'Section 2',
            weight: 0,
            items: [
              {
                id: 21,
                title: 'Item 21',
                weight: 0,
                type: SETTING_ITEM_TYPE.SELECT,
              },
            ],
          },
        ],
      });

      settingService.registerItem(SCOPE_2, 'SECTION_1', {
        id: 22,
        title: 'Item 22',
        weight: 100,
        type: SETTING_ITEM_TYPE.SELECT,
      });

      //
      // Before unregister
      //
      // Check SCOPE
      expect(settingStore.getPageById('PAGE_1')).toBeDefined();
      expect(settingStore.getSectionById('SECTION_1')).toBeDefined();
      expect(settingStore.getItemById(1)).toBeDefined();
      // Check SCOPE_2
      expect(settingStore.getPageById('PAGE_2')).toBeDefined();
      expect(settingStore.getSectionById('SECTION_2')).toBeDefined();
      expect(settingStore.getItemById(21)).toBeDefined();
      expect(settingStore.getItemById(22)).toBeDefined();

      settingService.unRegisterAll(SCOPE_1);

      //
      // After unregister scope 2
      //
      // Check SCOPE
      expect(settingStore.getPageById('PAGE_1')).toBeUndefined();
      expect(settingStore.getSectionById('SECTION_1')).toBeUndefined();
      expect(settingStore.getItemById(1)).toBeUndefined();
      // Check SCOPE_2
      expect(settingStore.getPageById('PAGE_2')).toBeDefined();
      expect(settingStore.getSectionById('SECTION_2')).toBeDefined();
      expect(settingStore.getItemById(21)).toBeDefined();
      expect(settingStore.getItemById(22)).toBeDefined();
    });
  });

  describe('goToSettingPage()', () => {
    it('should go to path of the page', () => {
      const { settingService, settingStore } = setup();

      settingService.registerPage(SCOPE_1, {
        id: 'PAGE_1',
        title: 'Page 1',
        path: '/page_1',
        weight: 0,
        sections: [],
      });

      settingService.goToSettingPage('PAGE_1');

      expect(history.push).toBeCalledWith(`${SETTING_ROUTE_ROOT}/page_1`);
      expect(settingStore.currentPage!.id).toBe('PAGE_1');
    });
  });
});
