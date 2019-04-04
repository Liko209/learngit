/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-04 12:21:25
 * Copyright © RingCentral. All rights reserved.
 */
import { container, Jupiter } from 'framework';
import { config } from '../../../module.config';
import { GlobalSearchStore } from '../../../store';
import { GroupService } from 'sdk/module/group';
import { SearchService } from 'sdk/module/search';
import { RecentSearchTypes } from 'sdk/module/search/entity';

jest.mock('@/containers/Notification');
jest.mock('sdk/api');
jest.mock('sdk/dao');
jest.mock('sdk/module/search');

jest.mock('../../../../../utils/i18nT');
jest.mock('../../../../../history', () => ({
  location: {
    pathname: '/messages/123',
  },
}));
import i18nT from '../../../../../utils/i18nT';
// import history from '../../../../../history';

import { SEARCH_SCOPE } from '../types';
import { InstantSearchViewModel } from '../InstantSearch.ViewModel';

GroupService.getInstance = jest.fn();

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
    searchService = new SearchService();
    searchService.doFuzzySearchPersons = jest.fn().mockImplementation(() => {
      return { terms: [], sortableModels: [{ id: 1 }] };
    });
    SearchService.getInstance = jest.fn().mockReturnValue(searchService);
    GroupService.getInstance.mockReturnValue(groupService);
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

  describe('resetData()', () => {
    it('should be reset selectIndex searchResult terms selectIndex ', () => {
      instantSearchViewModel.resetSelectIndex();
      expect(instantSearchViewModel.searchResult).toEqual([]);
      expect(instantSearchViewModel.terms).toEqual([]);
      expect(instantSearchViewModel.selectIndex).toEqual([-1, -1]);
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
      };
      jest
        .spyOn(instantSearchViewModel, 'contentSearchIds', 'get')
        .mockReturnValue([]);
      jest.spyOn(instantSearchViewModel, 'search').mockReturnValue(resultData);
      jest.spyOn(instantSearchViewModel, 'resetSelectIndex');
      await instantSearchViewModel.setSearchResult('value');
      expect(instantSearchViewModel.searchResult).toEqual([
        {
          ids: [],
          hasMore: true,
          type: RecentSearchTypes.SEARCH,
        },
        {
          ids: [1, 2],
          hasMore: true,
          type: RecentSearchTypes.PEOPLE,
        },
        {
          ids: [1, 2],
          hasMore: true,
          type: RecentSearchTypes.GROUP,
        },
        {
          ids: [1, 2],
          hasMore: true,
          type: RecentSearchTypes.TEAM,
        },
      ]);
      expect(instantSearchViewModel.terms).toEqual(['a']);
      expect(instantSearchViewModel.resetSelectIndex).toHaveBeenCalled();
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

  describe('hasMore()', () => {
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
    it('If search result section item > 3 should be has more', () => {
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
    it('If search result section item < 3 not has more', () => {
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

  describe('get contentSearchIds', () => {
    it('If is in conversation should be return [searchKey, searchKey in this conversation]', () => {
      const searchKey = 'abc';
      globalSearchStore.setSearchKey(searchKey);
      (i18nT as jest.Mock).mockReturnValue('in this conversation');
      expect(instantSearchViewModel.contentSearchIds).toEqual([
        searchKey,
        `${searchKey} in this conversation`,
      ]);
    });
  });

  describe('getSearchScope()', () => {
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
});
