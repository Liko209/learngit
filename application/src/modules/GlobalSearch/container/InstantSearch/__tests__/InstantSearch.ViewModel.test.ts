/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-04 12:21:25
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity, getGlobalValue } from '@/store/utils';
import { container } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';

import { config } from '../../../module.config';
import { GlobalSearchStore } from '../../../store';
import { SearchService } from 'sdk/module/search';
import { RecentSearchTypes } from 'sdk/module/search/entity';
import history from '../../../../../history';

jest.mock('sdk/module/config')
jest.mock('@/containers/Notification');
jest.mock('sdk/api');
jest.mock('sdk/dao');
jest.mock('sdk/module/search');
jest.mock('@/common/joinPublicTeam');
jest.mock('@/store/utils');
jest.mock('../../../../../utils/i18nT');

import i18nT from '../../../../../utils/i18nT';
// import history from '../../../../../history';

import { SEARCH_SCOPE, SEARCH_VIEW, SearchItemTypes, TAB_TYPE } from '../types';
import { InstantSearchViewModel } from '../InstantSearch.ViewModel';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

const ONLY_ONE_SECTION_LENGTH = 9;
const MORE_SECTION_LENGTH = 3;

const groupService = {
  doFuzzySearchGroups() {
    return { terms: [], sortableModels: [{ id: 2 }] };
  },
  doFuzzySearchTeams() {
    return { terms: [], sortableModels: [{ id: 3 }] };
  },
};

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

const jupiter = container.get(Jupiter);
jupiter.registerModule(config);

describe('InstantSearchViewModel', () => {
  let searchService: SearchService;
  let instantSearchViewModel: InstantSearchViewModel;
  let globalSearchStore: GlobalSearchStore;

  function setUp() {
    history.replace('/');
    searchService = new SearchService();
    searchService.doFuzzySearchPersons = jest.fn().mockImplementation(() => {
      return { terms: [], sortableModels: [{ id: 1 }] };
    });
    searchService.addRecentSearchRecord = jest.fn();
    ServiceLoader.getInstance = jest.fn((type: string) => {
      if (type === ServiceConfig.GROUP_SERVICE) {
        return groupService;
      }
      if (type === ServiceConfig.SEARCH_SERVICE) {
        return searchService;
      }
      return null;
    });
  }

  beforeEach(() => {
    container.snapshot();
    clearMocks();
    setUp();
    instantSearchViewModel = new InstantSearchViewModel();
    globalSearchStore = container.get(GlobalSearchStore);
  });

  afterEach(() => {
    container.restore();
  });

  it('setSelectIndex()', () => {
    instantSearchViewModel.setSelectIndex(1, 1);
    expect(instantSearchViewModel.selectIndex).toEqual([1, 1]);
  });

  describe('addRecentRecord()', () => {
    it('if value is number should be add record', () => {
      jest
        .spyOn(instantSearchViewModel, 'currentItemType', 'get')
        .mockReturnValue(SearchItemTypes.PEOPLE);
      instantSearchViewModel.addRecentRecord(1);
      expect(searchService.addRecentSearchRecord).toHaveBeenCalledWith(
        RecentSearchTypes.PEOPLE,
        1,
      );
    });

    it('if value is string and scope is global should be call add record not with group id', () => {
      instantSearchViewModel.setSelectIndex(0, 0);
      jest
        .spyOn(instantSearchViewModel, 'currentItemType', 'get')
        .mockReturnValue(SearchItemTypes.CONTENT);
      instantSearchViewModel.addRecentRecord('abc');
      expect(searchService.addRecentSearchRecord).toHaveBeenCalledWith(
        RecentSearchTypes.SEARCH,
        'abc',
        {},
      );
    });
    it('if value is string and scope is conversation should be call add record with group id', () => {
      const conversationId = 1;
      (getGlobalValue as jest.Mock).mockReturnValue(conversationId);
      instantSearchViewModel.setSelectIndex(0, 1);
      jest
        .spyOn(instantSearchViewModel, 'currentItemType', 'get')
        .mockReturnValue(SearchItemTypes.CONTENT);
      instantSearchViewModel.addRecentRecord('abc');
      expect(searchService.addRecentSearchRecord).toHaveBeenCalledWith(
        RecentSearchTypes.SEARCH,
        'abc',
        { groupId: conversationId },
      );
    });
  });

  describe('get currentItemType', () => {
    it('should return section type', async () => {
      instantSearchViewModel.setSelectIndex(0, 0);
      const resultData = [
        {
          ids: [1, 2],
          type: SearchItemTypes.GROUP,
          hasMore: true,
        },
      ];
      jest
        .spyOn(instantSearchViewModel, 'searchResult', 'get')
        .mockReturnValue(resultData);
      expect(instantSearchViewModel.currentItemType).toBe(
        SearchItemTypes.GROUP,
      );
    });
  });

  describe('get currentItemId', () => {
    it('If section index < 0 should be return null', async () => {
      instantSearchViewModel.setSelectIndex(-1, -1);
      const resultData = [
        {
          ids: [1, 2],
          type: SearchItemTypes.GROUP,
          hasMore: true,
        },
      ];
      jest
        .spyOn(instantSearchViewModel, 'searchResult', 'get')
        .mockReturnValue(resultData);
      expect(instantSearchViewModel.currentItemId).toBe(null);
    });
    it('If section index > 0 should be return id', async () => {
      instantSearchViewModel.setSelectIndex(0, 0);
      const resultData = [
        {
          ids: [1, 2],
          type: SearchItemTypes.GROUP,
          hasMore: true,
        },
      ];
      jest
        .spyOn(instantSearchViewModel, 'searchResult', 'get')
        .mockReturnValue(resultData);
      expect(instantSearchViewModel.currentItemId).toBe(1);
    });
  });

  describe('onEnter()', () => {
    beforeEach(() => {
      instantSearchViewModel.setSelectIndex(0, 0);
    });
    it('if select index < 0 should be return undefined', () => {
      instantSearchViewModel.setSelectIndex(-1, -1);
      const keyBoardEvent = {
        preventDefault: jest.fn(),
      } as any;
      expect(instantSearchViewModel.onEnter(keyBoardEvent)).toBeUndefined();
    });
    it('If select item type is people should be go to conversation', () => {
      const id = 1;
      jest.spyOn(instantSearchViewModel, 'goToConversation');
      jest
        .spyOn(instantSearchViewModel, 'currentItemId', 'get')
        .mockReturnValue(id);
      jest
        .spyOn(instantSearchViewModel, 'currentItemType', 'get')
        .mockReturnValue(SearchItemTypes.PEOPLE);
      const keyBoardEvent = {
        preventDefault: jest.fn(),
      } as any;
      instantSearchViewModel.onEnter(keyBoardEvent);
      expect(instantSearchViewModel.goToConversation).toHaveBeenCalledWith(id);
    });
    it('If select item type is content and select first should be global scope and go to full search [JPT-1567]', () => {
      const id = 1;
      instantSearchViewModel.setSelectIndex(0, 0);
      jest
        .spyOn(instantSearchViewModel, 'currentItemId', 'get')
        .mockReturnValue(id);
      jest
        .spyOn(instantSearchViewModel, 'currentItemType', 'get')
        .mockReturnValue(SearchItemTypes.CONTENT);
      jest
        .spyOn(instantSearchViewModel, 'getSearchScope')
        .mockReturnValue(SEARCH_SCOPE.GLOBAL);
      const keyBoardEvent = {
        preventDefault: jest.fn(),
      } as any;
      instantSearchViewModel.onEnter(keyBoardEvent);
      expect(globalSearchStore.searchScope).toBe(SEARCH_SCOPE.GLOBAL);
      expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.FULL_SEARCH);
    });
    it('If select item type is content and select second should be conversation scope and go to full search [JPT-1567]', () => {
      const id = 1;
      const conversationId = 1;
      instantSearchViewModel.setSelectIndex(0, 1);
      (getGlobalValue as jest.Mock).mockReturnValue(conversationId);
      jest
        .spyOn(instantSearchViewModel, 'currentItemId', 'get')
        .mockReturnValue(id);
      jest
        .spyOn(instantSearchViewModel, 'currentItemType', 'get')
        .mockReturnValue(SearchItemTypes.CONTENT);
      jest
        .spyOn(instantSearchViewModel, 'getSearchScope')
        .mockReturnValue(SEARCH_SCOPE.CONVERSATION);
      const keyBoardEvent = {
        preventDefault: jest.fn(),
      } as any;
      instantSearchViewModel.onEnter(keyBoardEvent);
      expect(globalSearchStore.groupId).toBe(conversationId);
      expect(globalSearchStore.searchScope).toBe(SEARCH_SCOPE.CONVERSATION);
      expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.FULL_SEARCH);
      expect(globalSearchStore.currentTab).toBe(TAB_TYPE.CONTENT);
    });
    it('If select item type is team/group and cannot join should be go to conversation', () => {
      const id = 1;
      const canJoin = {
        canJoin: false,
        group: {},
      } as any;
      jest.spyOn(instantSearchViewModel, 'goToConversation');
      jest
        .spyOn(instantSearchViewModel, 'canJoinTeam')
        .mockReturnValue(canJoin);
      jest
        .spyOn(instantSearchViewModel, 'currentItemId', 'get')
        .mockReturnValue(id);
      jest
        .spyOn(instantSearchViewModel, 'currentItemType', 'get')
        .mockReturnValue(SearchItemTypes.GROUP);
      const keyBoardEvent = {
        preventDefault: jest.fn(),
      } as any;
      instantSearchViewModel.onEnter(keyBoardEvent);
      expect(instantSearchViewModel.goToConversation).toHaveBeenCalledWith(id);
    });
    it('If select item type is team/group and can join should be call handleJoinTeam', () => {
      const id = 1;
      const canJoin = {
        canJoin: true,
        group: {},
      } as any;
      jest.spyOn(instantSearchViewModel, 'handleJoinTeam');
      jest
        .spyOn(instantSearchViewModel, 'canJoinTeam')
        .mockReturnValue(canJoin);
      jest
        .spyOn(instantSearchViewModel, 'currentItemId', 'get')
        .mockReturnValue(id);
      jest
        .spyOn(instantSearchViewModel, 'currentItemType', 'get')
        .mockReturnValue(SearchItemTypes.TEAM);
      const keyBoardEvent = {
        preventDefault: jest.fn(),
      } as any;
      instantSearchViewModel.onEnter(keyBoardEvent);
      expect(instantSearchViewModel.handleJoinTeam).toHaveBeenCalledWith(
        canJoin.group,
      );
    });
  });

  describe('resetData()', () => {
    it('should be reset selectIndex searchResult terms selectIndex ', () => {
      instantSearchViewModel.resetSelectIndex();
      expect(instantSearchViewModel.searchResult).toEqual([]);
      expect(instantSearchViewModel.terms).toEqual([]);
      expect(instantSearchViewModel.selectIndex).toEqual([-1, -1]);
    });
  });

  describe('setSelectIndexToDefault()', () => {
    it('should be set to [0,0] when called', () => {
      instantSearchViewModel.setSelectIndexToDefault();
      expect(instantSearchViewModel.selectIndex).toEqual([0, 0]);
    });
  });

  describe('setSearchResult()', () => {
    it('If search return null should be return', async () => {
      jest.spyOn(instantSearchViewModel, 'search').mockReturnValue(null);
      const ret = await instantSearchViewModel.setSearchResult('null');
      expect(ret).toBe(undefined);
    });
    it('If search has result should be set search result and terms and reset select index', async () => {
      const resultData = {
        terms: ['a'],
        people: {
          ids: [1, 2],
          hasMore: true,
        },
        groups: {
          ids: [1, 2],
          hasMore: true,
        },
        teams: {
          ids: [1, 2],
          hasMore: true,
        },
      } as any;
      jest
        .spyOn(instantSearchViewModel, 'contentSearchIds', 'get')
        .mockReturnValue([]);
      jest.spyOn(instantSearchViewModel, 'search').mockReturnValue(resultData);
      jest.spyOn(instantSearchViewModel, 'resetSelectIndex');
      jest.spyOn(instantSearchViewModel, 'setSelectIndexToDefault');
      await instantSearchViewModel.setSearchResult('value');
      expect(instantSearchViewModel.searchResult).toEqual([
        {
          ids: [],
          hasMore: false,
          type: SearchItemTypes.CONTENT,
        },
        {
          ids: [1, 2],
          hasMore: true,
          type: SearchItemTypes.PEOPLE,
        },
        {
          ids: [1, 2],
          hasMore: true,
          type: SearchItemTypes.GROUP,
        },
        {
          ids: [1, 2],
          hasMore: true,
          type: SearchItemTypes.TEAM,
        },
      ]);
      expect(instantSearchViewModel.terms).toEqual(['a']);
      expect(instantSearchViewModel.setSelectIndexToDefault).toHaveBeenCalled();
    });
  });

  describe('calculateSectionCount()', () => {
    it('If persons and groups and teams length = 0 should return 0', () => {
      const existCount = instantSearchViewModel.calculateSectionCount(
        {
          sortableModels: [],
        } as any,
        {
          sortableModels: [],
        } as any,
        {
          sortableModels: [],
        } as any,
      );
      expect(existCount).toBe(0);
    });
    it('If only one section exist should return 1', () => {
      const existCount1 = instantSearchViewModel.calculateSectionCount(
        {
          sortableModels: [1],
        } as any,
        {
          sortableModels: [],
        } as any,
        {
          sortableModels: [],
        } as any,
      );
      expect(existCount1).toBe(1);
      const existCount2 = instantSearchViewModel.calculateSectionCount(
        {
          sortableModels: [],
        } as any,
        {
          sortableModels: [1],
        } as any,
        {
          sortableModels: [],
        } as any,
      );
      expect(existCount2).toBe(1);
      const existCount3 = instantSearchViewModel.calculateSectionCount(
        {
          sortableModels: [],
        } as any,
        {
          sortableModels: [],
        } as any,
        {
          sortableModels: [1],
        } as any,
      );
      expect(existCount3).toBe(1);
    });
    it('If has two sections should return 2', () => {
      const existCount1 = instantSearchViewModel.calculateSectionCount(
        {
          sortableModels: [1],
        } as any,
        {
          sortableModels: [1],
        } as any,
        {
          sortableModels: [],
        } as any,
      );
      expect(existCount1).toBe(2);
      const existCount2 = instantSearchViewModel.calculateSectionCount(
        {
          sortableModels: [1],
        } as any,
        {
          sortableModels: [],
        } as any,
        {
          sortableModels: [1],
        } as any,
      );
      expect(existCount2).toBe(2);
      const existCount3 = instantSearchViewModel.calculateSectionCount(
        {
          sortableModels: [],
        } as any,
        {
          sortableModels: [1],
        } as any,
        {
          sortableModels: [1],
        } as any,
      );
      expect(existCount3).toBe(2);
    });
    it('If has three sections should return 3', () => {
      const existCount = instantSearchViewModel.calculateSectionCount(
        {
          sortableModels: [1],
        } as any,
        {
          sortableModels: [1],
        } as any,
        {
          sortableModels: [1],
        } as any,
      );
      expect(existCount).toBe(3);
    });
  });

  describe('hasMore() [JPT-1568]', () => {
    it('If sortableModels.length > needSliceNum should be true', () => {
      const hasMore = instantSearchViewModel.hasMore(
        {
          sortableModels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        } as any,
        1,
      );
      expect(hasMore).toBe(true);
    });
    it('If sortableModels.length < needSliceNum should be false', () => {
      const hasMore = instantSearchViewModel.hasMore(
        {
          sortableModels: [1, 2],
        } as any,
        3,
      );
      expect(hasMore).toBe(false);
    });
  });

  describe('getSection()', () => {
    it('If search result > 9 only show 9 items', () => {
      const section = instantSearchViewModel.getSection(
        {
          sortableModels: [
            { id: 1 },
            { id: 2 },
            { id: 3 },
            { id: 4 },
            { id: 5 },
            { id: 6 },
            { id: 7 },
            { id: 8 },
            { id: 9 },
            { id: 10 },
          ],
        } as any,
        1,
      );
      expect(section).toEqual({
        ids: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        models: [
          { id: 1 },
          { id: 2 },
          { id: 3 },
          { id: 4 },
          { id: 5 },
          { id: 6 },
          { id: 7 },
          { id: 8 },
          { id: 9 },
        ],
        hasMore: true,
      });
    });
    it('If search result section item > 3 should be has more [JPT-1568]', () => {
      const section1 = instantSearchViewModel.getSection(
        {
          sortableModels: [
            { id: 1 },
            { id: 2 },
            { id: 3 },
            { id: 4 },
            { id: 5 },
          ],
        } as any,
        2,
      );
      expect(section1).toEqual({
        ids: [1, 2, 3],
        models: [{ id: 1 }, { id: 2 }, { id: 3 }],
        hasMore: true,
      });
    });
    it('If search result section item < 3 not has more [JPT-1568]', () => {
      const section2 = instantSearchViewModel.getSection(
        {
          sortableModels: [{ id: 1 }, { id: 2 }],
        } as any,
        2,
      );
      expect(section2).toEqual({
        ids: [1, 2],
        hasMore: false,
        models: [{ id: 1 }, { id: 2 }],
      });
    });
    it('If search result is empty ids should be empty array', () => {
      const section = instantSearchViewModel.getSection(null, 0);
      expect(section).toEqual({
        ids: [],
        hasMore: false,
        models: [],
      });
    });
  });

  describe('getSectionItemSize()', () => {
    it('If calculateSectionCount < 1 should return ONLY_ONE_SECTION_LENGTH', () => {
      const num1 = instantSearchViewModel.getSectionItemSize(1);
      const num2 = instantSearchViewModel.getSectionItemSize(0);
      expect(num1).toBe(ONLY_ONE_SECTION_LENGTH);
      expect(num2).toBe(ONLY_ONE_SECTION_LENGTH);
    });
    it('If calculateSectionCount > 1 should return MORE_SECTION_LENGTH', () => {
      const num1 = instantSearchViewModel.getSectionItemSize(2);
      const num2 = instantSearchViewModel.getSectionItemSize(3);
      expect(num1).toBe(MORE_SECTION_LENGTH);
      expect(num2).toBe(MORE_SECTION_LENGTH);
    });
  });

  describe('get contentSearchIds [JPT-1552]', () => {
    it('If is in conversation should be return [searchKey, searchKey in this conversation]', () => {
      const searchKey = 'abc';
      history.replace('/messages/123');
      globalSearchStore.setSearchKey(searchKey);
      (i18nT as jest.Mock).mockReturnValue('in this conversation');
      expect(instantSearchViewModel.contentSearchIds).toEqual([
        searchKey,
        searchKey,
      ]);
    });
    it('If not in conversation should be return [searchKey]', () => {
      const searchKey = 'abc';
      history.replace('/bookmarks');
      globalSearchStore.setSearchKey(searchKey);
      (i18nT as jest.Mock).mockReturnValue('in this conversation');
      expect(instantSearchViewModel.contentSearchIds).toEqual([searchKey]);
    });
  });

  describe('get contentSearchIds [JPT-1552]', () => {
    it('If is in conversation should be return [searchKey, searchKey in this conversation]', () => {
      const searchKey = 'abc';
      history.replace('/messages/123');
      globalSearchStore.setSearchKey(searchKey);
      expect(instantSearchViewModel.contentSearchIds).toEqual([
        searchKey,
        searchKey,
      ]);
    });
    it('If not in conversation should be return [searchKey]', () => {
      const searchKey = 'abc';
      history.replace('/bookmarks');
      globalSearchStore.setSearchKey(searchKey);
      expect(instantSearchViewModel.contentSearchIds).toEqual([searchKey]);
    });
  });

  describe('getSearchScope() [JPT-1557]', () => {
    it('If index = 0 should be return global scope', () => {
      instantSearchViewModel = new InstantSearchViewModel();
      const scope = instantSearchViewModel.getSearchScope(0);
      expect(scope).toBe(SEARCH_SCOPE.GLOBAL);
    });
    it('If index = 1 should be return conversation scope', () => {
      instantSearchViewModel = new InstantSearchViewModel();
      const scope = instantSearchViewModel.getSearchScope(1);
      expect(scope).toBe(SEARCH_SCOPE.CONVERSATION);
    });
  });

  describe('onClear()', () => {
    it('global search store search key should be empty', () => {
      instantSearchViewModel.onClear();
      expect(globalSearchStore.searchKey).toBe('');
    });
  });
  describe('onClose()', () => {
    it('global search store open should be false', () => {
      instantSearchViewModel.onClear();
      expect(globalSearchStore.open).toBeFalsy();
    });
  });

  describe('canJoinTeam()', () => {
    it('If isTeam && privacy = protected & !isMember canJoinTeam should be true', () => {
      const group = {
        isTeam: true,
        privacy: 'protected',
        members: [1],
        isMember: false,
      };
      (getEntity as jest.Mock).mockReturnValue(group);
      expect(instantSearchViewModel.canJoinTeam(1).canJoin).toBeTruthy();
      expect(instantSearchViewModel.canJoinTeam(1).group).toEqual(group);
    });
    it('If isTeam = false canJoinTeam should be false', () => {
      const group = {
        isTeam: false,
      };
      (getEntity as jest.Mock).mockReturnValue(group);
      expect(instantSearchViewModel.canJoinTeam(1).canJoin).toBeFalsy();
      expect(instantSearchViewModel.canJoinTeam(1).group).toEqual(group);
    });
    it('If isMember = true canJoinTeam should be false', () => {
      const group = {
        isMember: true,
      };
      (getEntity as jest.Mock).mockReturnValue(group);
      expect(instantSearchViewModel.canJoinTeam(1).canJoin).toBeFalsy();
      expect(instantSearchViewModel.canJoinTeam(1).group).toEqual(group);
    });
    it('If privacy != protected canJoinTeam should be false', () => {
      const group = {
        privacy: '',
      };
      (getEntity as jest.Mock).mockReturnValue(group);
      expect(instantSearchViewModel.canJoinTeam(1).canJoin).toBeFalsy();
      expect(instantSearchViewModel.canJoinTeam(1).group).toEqual(group);
    });
  });

  describe('onKeyUp()', () => {
    it('if cell index > 0 should be selectIndex of section and cell - 1', () => {
      instantSearchViewModel.setSelectIndex(0, 1);
      jest.spyOn(instantSearchViewModel, 'setSelectIndex');
      instantSearchViewModel.onKeyUp();
      expect(instantSearchViewModel.setSelectIndex).toHaveBeenCalledWith(0, 0);
    });
    it('if section <= 0 should be return undefined', () => {
      instantSearchViewModel.setSelectIndex(0, 0);
      jest.spyOn(instantSearchViewModel, 'setSelectIndex');
      expect(instantSearchViewModel.onKeyUp()).toBeUndefined();
    });
    it('if section > 0 and cell index <= 0 and nextSection !== -1 should be call setSelectIndex', () => {
      instantSearchViewModel.setSelectIndex(1, 0);
      jest.spyOn(instantSearchViewModel, 'setSelectIndex');
      jest
        .spyOn(instantSearchViewModel, 'findNextValidSectionLength')
        .mockReturnValue([0, 1]);
      instantSearchViewModel.onKeyUp();
      expect(instantSearchViewModel.setSelectIndex).toHaveBeenCalledWith(0, 0);
    });
    it('if section > 0 and cell index <= 0 and nextSection === -1 should not be call setSelectIndex', () => {
      instantSearchViewModel.setSelectIndex(1, 0);
      jest.spyOn(instantSearchViewModel, 'setSelectIndex');
      jest
        .spyOn(instantSearchViewModel, 'findNextValidSectionLength')
        .mockReturnValue([-1, 1]);
      instantSearchViewModel.onKeyUp();
      expect(instantSearchViewModel.setSelectIndex).not.toHaveBeenCalled();
    });
  });

  describe('onKeyDown()', () => {
    it('if not search item should be return undefined', () => {
      instantSearchViewModel.setSelectIndex(-1, -1);
      const resultData = [
        {
          ids: [1, 2],
          type: SearchItemTypes.GROUP,
          hasMore: true,
        },
      ];
      jest
        .spyOn(instantSearchViewModel, 'searchResult', 'get')
        .mockReturnValue(resultData);

      expect(instantSearchViewModel.onKeyDown()).toBeUndefined();
    });
    it('if cell index < current section len cell should be + 1', () => {
      instantSearchViewModel.setSelectIndex(0, 0);
      jest.spyOn(instantSearchViewModel, 'setSelectIndex');
      const resultData = [
        {
          ids: [1, 2],
          type: SearchItemTypes.PEOPLE,
          hasMore: true,
        },
      ];
      jest
        .spyOn(instantSearchViewModel, 'searchResult', 'get')
        .mockReturnValue(resultData);
      instantSearchViewModel.onKeyDown();
      expect(instantSearchViewModel.setSelectIndex).toHaveBeenCalledWith(0, 1);
    });
    it('if currentSection >= search result length should be return undefined', () => {
      instantSearchViewModel.setSelectIndex(0, 0);
      jest.spyOn(instantSearchViewModel, 'setSelectIndex');
      const resultData = [
        {
          ids: [1, 2],
          type: SearchItemTypes.PEOPLE,
          hasMore: true,
        },
      ];
      jest
        .spyOn(instantSearchViewModel, 'searchResult', 'get')
        .mockReturnValue(resultData);
      expect(instantSearchViewModel.onKeyDown()).toBeUndefined();
    });

    it('if nextSection !== -1 should be to next section', () => {
      instantSearchViewModel.setSelectIndex(0, 2);
      jest.spyOn(instantSearchViewModel, 'setSelectIndex');
      const resultData = [
        {
          ids: [1, 2, 3],
          type: SearchItemTypes.PEOPLE,
          hasMore: true,
        },
        {
          ids: [1, 2, 3],
          type: SearchItemTypes.GROUP,
          hasMore: true,
        },
      ];
      jest
        .spyOn(instantSearchViewModel, 'searchResult', 'get')
        .mockReturnValue(resultData);
      jest
        .spyOn(instantSearchViewModel, 'findNextValidSectionLength')
        .mockReturnValue([1, 1]);
      instantSearchViewModel.onKeyDown();
      expect(instantSearchViewModel.setSelectIndex).toHaveBeenCalledWith(1, 0);
    });
    it('if nextSection === -1 should not be change select index', () => {
      instantSearchViewModel.setSelectIndex(0, 2);
      jest.spyOn(instantSearchViewModel, 'setSelectIndex');
      const resultData = [
        {
          ids: [1, 2, 3],
          type: SearchItemTypes.PEOPLE,
          hasMore: true,
        },
        {
          ids: [1, 2, 3],
          type: SearchItemTypes.GROUP,
          hasMore: true,
        },
      ];
      jest
        .spyOn(instantSearchViewModel, 'searchResult', 'get')
        .mockReturnValue(resultData);
      jest
        .spyOn(instantSearchViewModel, 'findNextValidSectionLength')
        .mockReturnValue([-1, 1]);
      instantSearchViewModel.onKeyDown();
      expect(instantSearchViewModel.setSelectIndex).not.toHaveBeenCalled();
    });
  });

  describe('onShowMore() [JPT-1567]', () => {
    it('if type is group should switch full search and tab is group', () => {
      instantSearchViewModel.onShowMore(SearchItemTypes.GROUP)();
      expect(globalSearchStore.currentTab).toBe(TAB_TYPE.GROUPS);
      expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.FULL_SEARCH);
    });
    it('if type is team should switch full search and tab is team', () => {
      instantSearchViewModel.onShowMore(SearchItemTypes.PEOPLE)();
      expect(globalSearchStore.currentTab).toBe(TAB_TYPE.PEOPLE);
      expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.FULL_SEARCH);
    });
    it('if type is people should switch full search and tab is people', () => {
      instantSearchViewModel.onShowMore(SearchItemTypes.TEAM)();
      expect(globalSearchStore.currentTab).toBe(TAB_TYPE.TEAM);
      expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.FULL_SEARCH);
    });
  });
});
