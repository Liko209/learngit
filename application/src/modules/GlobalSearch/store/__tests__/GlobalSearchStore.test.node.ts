/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-03 12:51:29
 * Copyright © RingCentral. All rights reserved.
 */
import { GlobalSearchStore } from '../GlobalSearchStore';
import { TAB_TYPE, SEARCH_VIEW } from '../../types';
import { Dialer } from '../../../telephony/container';

describe('GlobalSearchStore', () => {
  let globalSearchStore: GlobalSearchStore;
  beforeEach(() => {
    globalSearchStore = new GlobalSearchStore();
  });
  it('setOpen()', () => {
    globalSearchStore.setOpen(false);
    expect(globalSearchStore.open).toBeFalsy();
    globalSearchStore.setOpen(true);
    expect(globalSearchStore.open).toBeTruthy();
  });
  it('setSearchKey()', () => {
    globalSearchStore.setSearchKey('123');
    expect(globalSearchStore.searchKey).toBe('123');
  });
  it('setSearchKey()', () => {
    globalSearchStore.setGroupId(123);
    expect(globalSearchStore.groupId).toBe(123);
  });
  it('setCurrentTab()', () => {
    globalSearchStore.setCurrentTab(TAB_TYPE.CONTENT);
    expect(globalSearchStore.currentTab).toBe(TAB_TYPE.CONTENT);
  });
  it('setCurrentView()', () => {
    globalSearchStore.setCurrentView(SEARCH_VIEW.RECENT_SEARCH);
    expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.RECENT_SEARCH);
  });
  it('clearSearchKey()', () => {
    globalSearchStore.clearSearchKey();
    expect(globalSearchStore.searchKey).toBe('');
    expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.RECENT_SEARCH);
  });
  it('addExtensions()', () => {
    globalSearchStore.addExtensions('Dialer', Dialer);
    expect(globalSearchStore.extensions['Dialer'].has(Dialer)).toBeTruthy();
  });
});
