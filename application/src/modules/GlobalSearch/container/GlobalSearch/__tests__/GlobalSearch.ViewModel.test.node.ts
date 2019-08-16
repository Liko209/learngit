/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-03 14:24:26
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { GlobalSearchViewModel } from '../GlobalSearch.ViewModel';
import { config } from '../../../module.config';
import { GlobalSearchStore } from '../../../store';
import { SEARCH_VIEW } from '../types';

const jupiter = container.get(Jupiter);
jupiter.registerModule(config);

describe('GlobalSearchViewModel', () => {
  let globalSearchStore: GlobalSearchStore;
  let globalSearchViewModel: GlobalSearchViewModel;

  beforeEach(() => {
    container.snapshot();
    globalSearchStore = container.get(GlobalSearchStore);
    globalSearchViewModel = new GlobalSearchViewModel();
  });

  afterEach(() => {
    container.restore();
  });

  describe('onChange [JPT-1567]', () => {
    it('If search key is blank should be should be show recent search', () => {
      const emptyValue = '     ';
      globalSearchViewModel.onChange(emptyValue);
      expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.RECENT_SEARCH);
      expect(globalSearchStore.searchKey).toBe(emptyValue);
    });
    it('If search key is empty current view should be recent search', () => {
      const emptyValue = '';
      globalSearchViewModel.onChange(emptyValue);
      expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.RECENT_SEARCH);
      expect(globalSearchStore.searchKey).toBe(emptyValue);
    });
    it('If search key not empty current view should be instant search', () => {
      const value = '123';
      globalSearchViewModel.onChange(value);
      expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.INSTANT_SEARCH);
      expect(globalSearchStore.searchKey).toBe(value);
    });
  });

  describe('onClose', () => {
    it('If close global search globalSearchStore open should be false', () => {
      globalSearchViewModel.onClose();
      expect(globalSearchStore.open).toBeFalsy();
    });
  });
});
