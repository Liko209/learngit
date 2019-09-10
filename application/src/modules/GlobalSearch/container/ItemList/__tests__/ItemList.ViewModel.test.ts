/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-04 12:21:25
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { config } from '../../../module.config';
import { SearchService } from 'sdk/module/search';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { RecentSearchTypes } from 'sdk/module/search/entity';

import { SearchItemTypes } from '../types';
import { ItemListViewModel } from '../ItemList.ViewModel';

jest.mock('sdk/module/config');
jest.mock('@/containers/Notification');
jest.mock('sdk/api');
jest.mock('sdk/dao');
jest.mock('sdk/module/search');
jest.mock('@/common/joinPublicTeam');
jest.mock('@/store/utils');
jest.mock('../../../../../utils/i18nT');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

const jupiter = container.get(Jupiter);
jupiter.registerModule(config);

describe('ItemListViewModel', () => {
  let searchService: SearchService;
  let itemListViewModel: ItemListViewModel;

  function setUp() {
    searchService = new SearchService();
    searchService.doFuzzySearchPersons = jest.fn().mockImplementation(() => {
      return { terms: [], sortableModels: [{ id: 1 }] };
    });
    searchService.clearRecentSearchRecords = jest.fn();
    searchService.getRecentSearchRecords = jest.fn().mockReturnValue([]);
    ServiceLoader.getInstance = jest.fn().mockReturnValue(searchService);
  }

  beforeEach(() => {
    clearMocks();
    setUp();
    itemListViewModel = new ItemListViewModel();
  });

  describe('onKeyDown()', () => {
    it('if select index === recent record length should be return length - 1', () => {
      itemListViewModel.setSelectIndex(1);
      itemListViewModel.onKeyDown([1, 2]);
      expect(itemListViewModel.selectIndex).toBe(1);
    });

    it('if select index !== recent record length select index should be + 1', () => {
      itemListViewModel.setSelectIndex(1);
      itemListViewModel.onKeyDown([1, 2, 3]);
      expect(itemListViewModel.selectIndex).toBe(2);
    });
  });
  describe('onEnter()', () => {
    it('should be call onSelectItem and add recent', () => {
      const currentItemType = SearchItemTypes.PEOPLE;
      jest
        .spyOn(itemListViewModel, 'addRecentRecord')
        .mockImplementation(() => {});
      jest
        .spyOn(itemListViewModel, 'onSelectItem')
        .mockImplementation(() => {});
      const keyBoardEvent = {
        preventDefault: jest.fn(),
      } as any;
      itemListViewModel.setSelectIndex(0);
      itemListViewModel.onEnter(keyBoardEvent, [1, 2], currentItemType);
      expect(itemListViewModel.onSelectItem).toHaveBeenCalledWith(
        keyBoardEvent,
        1,
        currentItemType,
      );
      expect(itemListViewModel.addRecentRecord).toHaveBeenCalled();
    });
  });

  describe('addRecentRecord()', () => {
    it('if type is SEARCH should be add recent with SEARCH', () => {
      itemListViewModel.addRecentRecord(SearchItemTypes.SEARCH, 'abc');
      expect(searchService.addRecentSearchRecord).toHaveBeenCalledWith(
        RecentSearchTypes.SEARCH,
        'abc',
      );
    });
    it('if type is GROUP should be add recent with GROUP', () => {
      itemListViewModel.addRecentRecord(SearchItemTypes.GROUP, 1);
      expect(searchService.addRecentSearchRecord).toHaveBeenCalledWith(
        RecentSearchTypes.GROUP,
        1,
      );
    });
    it('if type is TEAM should be add recent with TEAM', () => {
      itemListViewModel.addRecentRecord(SearchItemTypes.TEAM, 1);
      expect(searchService.addRecentSearchRecord).toHaveBeenCalledWith(
        RecentSearchTypes.TEAM,
        1,
      );
    });
    it('if type is PEOPLE should be add recent with PEOPLE', () => {
      itemListViewModel.addRecentRecord(SearchItemTypes.PEOPLE, 1);
      expect(searchService.addRecentSearchRecord).toHaveBeenCalledWith(
        RecentSearchTypes.PEOPLE,
        1,
      );
    });
  });
});
