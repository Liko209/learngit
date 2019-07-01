/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-19 18:53:26
 * Copyright © RingCentral. All rights reserved.
 */
import { autorun } from 'mobx';
import { SettingPage } from '@/interface/setting';
import { SettingStore, SettingStoreScope } from '../SettingStore';
import { isItemVisible } from '../helper';
import {
  buildGeneralPageAndSection,
  buildSection,
  buildItem,
  buildPage,
} from './helper';
import {
  SETTING_PAGE__GENERAL as PAGE__GENERAL,
  SETTING_SECTION__GENERAL as SECTION__GENERAL,
  SETTING_ITEM__1 as ITEM__1,
  SETTING_SECTION__1 as SECTION__1,
  SETTING_PAGE__1 as PAGE__1,
  SETTING_PAGE__2 as PAGE__2,
  SETTING_SECTION__2 as SECTION__2,
  SETTING_ITEM__2 as ITEM__2,
} from './constant';

jest.mock('../helper');

const SCOPE = Symbol('SCOPE');
const SCOPE_2 = Symbol('SCOPE_2');
const SCOPE_3 = Symbol('SCOPE_3');

function setupWithPage(page: SettingPage = buildGeneralPageAndSection()) {
  const store = new SettingStore();
  store.useScope(SCOPE).addPage(page);
  return store;
}

describe('SettingStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('useScope()', () => {
    it('should add a new SettingStoreScope', () => {
      const store = new SettingStore();
      expect(store.useScope(SCOPE)).toBeInstanceOf(SettingStoreScope);
    });
    it('should return same SettingStoreScope', () => {
      const store = new SettingStore();
      expect(store.useScope(SCOPE)).toBe(store.useScope(SCOPE));
    });
  });

  describe('addPage()', () => {
    it('should add page', () => {
      const store = setupWithPage();
      const scope = store.useScope(SCOPE);
      const scope2 = store.useScope(SCOPE_2);
      scope.addPage(buildPage(PAGE__1));
      scope2.addPage(buildPage(PAGE__2));
      expect(store.getAllPages()).toEqual([PAGE__GENERAL, PAGE__1, PAGE__2]);
      expect(store.getPageById(PAGE__GENERAL)).not.toBeUndefined();
      expect(store.getPageSections(PAGE__GENERAL)).toContain(SECTION__GENERAL);
    });
  });

  describe('addSection()', () => {
    it('should add section', () => {
      const store = setupWithPage();
      const scope = store.useScope(SCOPE);
      const scope2 = store.useScope(SCOPE_2);
      scope.addSection(PAGE__GENERAL, buildSection(SECTION__1));
      scope2.addSection(PAGE__GENERAL, buildSection(SECTION__2));
      expect(store.getPageSections(PAGE__GENERAL)).toEqual([
        SECTION__GENERAL,
        SECTION__1,
        SECTION__2,
      ]);
    });
  });

  describe('addItem()', () => {
    it('should add item', () => {
      const store = setupWithPage();
      const scope = store.useScope(SCOPE);
      const scope2 = store.useScope(SCOPE_2);
      scope.addItem(SECTION__GENERAL, buildItem(ITEM__1));
      scope2.addItem(SECTION__GENERAL, buildItem(ITEM__2));
      expect(store.getSectionItems(SECTION__GENERAL)).toEqual([
        ITEM__1,
        ITEM__2,
      ]);
      expect(store.getPageItems(PAGE__GENERAL)).toEqual([ITEM__1, ITEM__2]);
    });
  });

  describe('no empty getter functions', () => {
    it('should return no empty section in the page [JPT-2187]', () => {
      const store = setupWithPage();
      const scope = store.useScope(SCOPE);
      const scope2 = store.useScope(SCOPE_2);
      scope.addSection(
        PAGE__GENERAL,
        buildSection(SECTION__1, [buildItem(ITEM__1), buildItem(ITEM__2)]),
      );
      isItemVisible.mockImplementation(id => {
        return {
          [ITEM__1]: false,
          [ITEM__2]: true,
        }[id];
      });
      scope2.addSection(PAGE__GENERAL, buildSection(SECTION__2));
      expect(store.getNoEmptyPages()).toEqual([PAGE__GENERAL]);
      expect(store.getNoEmptyPageSections(PAGE__GENERAL)).toEqual([SECTION__1]);
      expect(store.getSectionVisibleItems(SECTION__1)).toEqual([2]);
    });
  });

  describe('mobx observable', () => {
    it('should trigger autorun when add item', () => {
      const store = setupWithPage(buildGeneralPageAndSection());
      const storeScope2 = store.useScope(SCOPE_2);
      jest.spyOn(store, 'getSectionItems');

      //
      // autorun x 1
      //
      autorun(() => store.getSectionItems(SECTION__GENERAL));
      //
      // autorun x 2
      // addItem() should trigger autorun
      //
      storeScope2.addItem(SECTION__GENERAL, buildItem(ITEM__1));
      //
      // autorun x 3
      // clear() should Trigger autorun
      //
      storeScope2.clear();
      //
      // autorun x 4
      // use new scope should trigger autorun
      //
      store.useScope(SCOPE_3);
      //
      // autorun x 5
      // addItem() to another scope should trigger autorun
      //
      store.useScope(SCOPE_3).addItem(SECTION__GENERAL, buildItem(ITEM__2));

      expect(store.getSectionItems).toHaveBeenCalledTimes(5);
    });
  });
});
