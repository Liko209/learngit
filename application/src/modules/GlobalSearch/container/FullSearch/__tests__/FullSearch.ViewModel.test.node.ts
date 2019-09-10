/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-19 10:46:47
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { GlobalSearchService } from '@/modules/GlobalSearch/service';
import { GlobalSearchStore } from '@/modules/GlobalSearch/store';
import { config } from '@/modules/GlobalSearch/module.config';
import { FullSearchViewModel } from '../FullSearch.ViewModel';
import { TAB_TYPE } from '../types';

const jupiter = container.get(Jupiter);
jupiter.registerModule(config);

const globalSearchService = container.get(GlobalSearchService);
const globalSearchStore = container.get(GlobalSearchStore);
const fullSearchVM = new FullSearchViewModel();

describe('FullSearch.ViewModel', () => {
  describe('jumpToConversationCallback', () => {
    it('should jump to conversation callback', () => {
      globalSearchService.closeGlobalSearch = jest.fn();
      globalSearchStore.clearSearchKey = jest.fn();
      globalSearchStore.open = true;
      fullSearchVM.jumpToConversationCallback();
      expect(globalSearchService.closeGlobalSearch).toHaveBeenCalled();
      expect(globalSearchStore.clearSearchKey).toHaveBeenCalled();
    });
  });
  describe('get currentTab', () => {
    it('should return current tab', () => {
      const currentTab = TAB_TYPE.CONTENT;
      fullSearchVM.setCurrentTab(currentTab);
      expect(fullSearchVM.currentTab).toEqual(currentTab);
    });
  });
  describe('resetSearchScope', () => {
    it('should reset search scope', () => {
      globalSearchStore.setSearchScope = jest.fn();
      fullSearchVM.resetSearchScope();
      expect(globalSearchStore.setSearchScope).toBeCalled;
    });
  });
});
