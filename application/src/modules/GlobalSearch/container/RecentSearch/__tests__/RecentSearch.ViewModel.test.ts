/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-04 12:21:25
 * Copyright © RingCentral. All rights reserved.
 */
import { container, Jupiter } from 'framework';
import { config } from '../../../module.config';
import { GlobalSearchStore } from '../../../store';
import { SearchService } from 'sdk/module/search';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { RecentSearchTypes } from 'sdk/module/search/entity';

import history from '../../../../../history';

jest.mock('@/containers/Notification');
jest.mock('sdk/api');
jest.mock('sdk/dao');
jest.mock('sdk/module/search');
jest.mock('@/common/joinPublicTeam');
jest.mock('@/store/utils');
jest.mock('../../../../../utils/i18nT');

import { SearchItemTypes } from '../types';
import { RecentSearchViewModel } from '../RecentSearch.ViewModel';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

const jupiter = container.get(Jupiter);
jupiter.registerModule(config);

describe('RecentSearchViewModel', () => {
  let searchService: SearchService;
  let recentSearchViewModel: RecentSearchViewModel;
  let globalSearchStore: GlobalSearchStore;

  function setUp() {
    history.replace('/');
    searchService = new SearchService();
    searchService.doFuzzySearchPersons = jest.fn().mockImplementation(() => {
      return { terms: [], sortableModels: [{ id: 1 }] };
    });
    searchService.clearRecentSearchRecords = jest.fn();
    searchService.getRecentSearchRecords = jest.fn().mockReturnValue([]);
    ServiceLoader.getInstance = jest.fn().mockReturnValue(searchService);
  }

  beforeEach(() => {
    container.snapshot();
    clearMocks();
    setUp();
    recentSearchViewModel = new RecentSearchViewModel();
    globalSearchStore = container.get(GlobalSearchStore);
  });

  afterEach(() => {
    container.restore();
  });

  describe('onKeyDown()', () => {
    it('if select index === recent record length should be return length - 1', () => {
      jest
        .spyOn(recentSearchViewModel, 'recentRecord', 'get')
        .mockReturnValue([1, 2]);
      recentSearchViewModel.setSelectIndex(1);
      recentSearchViewModel.onKeyDown();
      expect(recentSearchViewModel.selectIndex).toBe(1);
    });

    it('if select index !== recent record length select index should be + 1', () => {
      jest
        .spyOn(recentSearchViewModel, 'recentRecord', 'get')
        .mockReturnValue([1, 2, 3]);
      recentSearchViewModel.setSelectIndex(1);
      recentSearchViewModel.onKeyDown();
      expect(recentSearchViewModel.selectIndex).toBe(2);
    });
  });
  describe('onEnter()', () => {
    it('if has group id should be call onSelectItem with group id and add recent', () => {
      jest
        .spyOn(recentSearchViewModel, 'currentItemValue', 'get')
        .mockReturnValue(null);

      const keyBoardEvent = {
        preventDefault: jest.fn(),
      } as any;
      expect(recentSearchViewModel.onEnter(keyBoardEvent)).toBeUndefined();
    });
    it('if has group id should be call onSelectItem with group id and add recent [JPT-1567]', () => {
      const id = 1;
      const currentItemType = SearchItemTypes.PEOPLE;
      const groupId = 2;
      jest
        .spyOn(recentSearchViewModel, 'addRecentRecord')
        .mockImplementation(() => {});
      jest
        .spyOn(recentSearchViewModel, 'onSelectItem')
        .mockImplementation(() => {});
      jest
        .spyOn(recentSearchViewModel, 'currentItemValue', 'get')
        .mockReturnValue(id);
      jest
        .spyOn(recentSearchViewModel, 'currentItemType', 'get')
        .mockReturnValue(currentItemType);
      jest
        .spyOn(recentSearchViewModel, 'currentGroupId', 'get')
        .mockReturnValue(groupId);
      const keyBoardEvent = {
        preventDefault: jest.fn(),
      } as any;
      recentSearchViewModel.onEnter(keyBoardEvent);
      expect(recentSearchViewModel.onSelectItem).toHaveBeenCalledWith(
        keyBoardEvent,
        id,
        currentItemType,
        { groupId },
      );
      expect(recentSearchViewModel.addRecentRecord).toHaveBeenCalled();
    });
    it('if has group id should be call onSelectItem with group id and add recent', () => {
      const id = 1;
      const currentItemType = SearchItemTypes.PEOPLE;
      jest
        .spyOn(recentSearchViewModel, 'addRecentRecord')
        .mockImplementation(() => {});
      jest
        .spyOn(recentSearchViewModel, 'onSelectItem')
        .mockImplementation(() => {});
      jest
        .spyOn(recentSearchViewModel, 'currentItemValue', 'get')
        .mockReturnValue(id);
      jest
        .spyOn(recentSearchViewModel, 'currentItemType', 'get')
        .mockReturnValue(currentItemType);
      jest
        .spyOn(recentSearchViewModel, 'currentGroupId', 'get')
        .mockReturnValue(null);
      const keyBoardEvent = {
        preventDefault: jest.fn(),
      } as any;
      recentSearchViewModel.onEnter(keyBoardEvent);
      expect(recentSearchViewModel.onSelectItem).toHaveBeenCalledWith(
        keyBoardEvent,
        id,
        currentItemType,
        undefined,
      );
      expect(recentSearchViewModel.addRecentRecord).toHaveBeenCalled();
    });
  });

  describe('clearRecent()', () => {
    it('should be clear recent record', () => {
      recentSearchViewModel.recentRecord = [1, 2];
      recentSearchViewModel.clearRecent();
      expect(searchService.clearRecentSearchRecords).toHaveBeenCalled();
      expect(recentSearchViewModel.recentRecord).toEqual([]);
    });
  });

  describe('addRecentRecord()', () => {
    it('if type is SEARCH and has group id should be add recent with SEARCH and group id', () => {
      const params = { groupId: 1 };
      jest
        .spyOn(recentSearchViewModel, 'currentItemType', 'get')
        .mockReturnValue(SearchItemTypes.SEARCH);
      recentSearchViewModel.addRecentRecord('abc', params);
      expect(searchService.addRecentSearchRecord).toHaveBeenCalledWith(
        RecentSearchTypes.SEARCH,
        'abc',
        params,
      );
    });
    it('if type is SEARCH should be add recent with SEARCH', () => {
      jest
        .spyOn(recentSearchViewModel, 'currentItemType', 'get')
        .mockReturnValue(SearchItemTypes.SEARCH);
      recentSearchViewModel.addRecentRecord('abc');
      expect(searchService.addRecentSearchRecord).toHaveBeenCalledWith(
        RecentSearchTypes.SEARCH,
        'abc',
        {},
      );
    });
    it('if type is GROUP should be add recent with GROUP', () => {
      jest
        .spyOn(recentSearchViewModel, 'currentItemType', 'get')
        .mockReturnValue(SearchItemTypes.GROUP);
      recentSearchViewModel.addRecentRecord(1);
      expect(searchService.addRecentSearchRecord).toHaveBeenCalledWith(
        RecentSearchTypes.GROUP,
        1,
        {},
      );
    });
    it('if type is TEAM should be add recent with TEAM', () => {
      jest
        .spyOn(recentSearchViewModel, 'currentItemType', 'get')
        .mockReturnValue(SearchItemTypes.TEAM);
      recentSearchViewModel.addRecentRecord(1);
      expect(searchService.addRecentSearchRecord).toHaveBeenCalledWith(
        RecentSearchTypes.TEAM,
        1,
        {},
      );
    });
    it('if type is PEOPLE should be add recent with PEOPLE', () => {
      jest
        .spyOn(recentSearchViewModel, 'currentItemType', 'get')
        .mockReturnValue(SearchItemTypes.PEOPLE);
      recentSearchViewModel.addRecentRecord(1);
      expect(searchService.addRecentSearchRecord).toHaveBeenCalledWith(
        RecentSearchTypes.PEOPLE,
        1,
        {},
      );
    });
  });
});
