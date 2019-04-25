/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-03 12:51:29
 * Copyright © RingCentral. All rights reserved.
 */
import { container, Jupiter } from 'framework';
import { GlobalSearchStore } from '../../store/GlobalSearchStore';
import { GlobalSearchService } from '../GlobalSearchService';
import { config } from '../../module.config';
import { SEARCH_VIEW } from '../../types';
// jest.mock('../../store/GlobalSearchStore');
const jupiter = container.get(Jupiter);
jupiter.registerModule(config);

describe('GlobalSearchService', () => {
  let globalSearchService: GlobalSearchService;
  let globalSearchStore: GlobalSearchStore;
  beforeEach(() => {
    container.snapshot();
    globalSearchService = jupiter.get(GlobalSearchService);
    globalSearchStore = jupiter.get(GlobalSearchStore);
  });
  afterEach(() => {
    container.restore();
  });
  describe('openGlobalSearch()', () => {
    it('if search key is empty should be open recent search', () => {
      globalSearchStore.setSearchKey('');
      globalSearchService.openGlobalSearch();
      expect(globalSearchStore.open).toBeTruthy();
      expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.RECENT_SEARCH);
    });
    it('if search key is not empty should be open instant search', () => {
      globalSearchStore.setSearchKey('a');
      globalSearchService.openGlobalSearch();
      expect(globalSearchStore.open).toBeTruthy();
      expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.INSTANT_SEARCH);
    });
  });
  describe('closeGlobalSearch()', () => {
    it('global search store open should be false', () => {
      globalSearchService.closeGlobalSearch();
      expect(globalSearchStore.open).toBeFalsy();
    });
  });
});
