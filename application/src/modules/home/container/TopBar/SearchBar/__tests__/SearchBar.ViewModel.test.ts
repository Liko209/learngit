/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-26 20:32:51
 * Copyright © RingCentral. All rights reserved.
 */
import { GroupService } from 'sdk/module/group';
import { SearchService } from 'sdk/module/search';
import { SearchBarViewModel } from '../SearchBar.ViewModel';
import { RecentSearchTypes } from 'sdk/module/search/entity';

jest.mock('../../../../../../store/utils');
jest.mock('@/containers/Notification');
jest.mock('sdk/api');
jest.mock('sdk/dao');
jest.mock('sdk/module/search');

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

describe('SearchBarViewModel', () => {
  let searchService: SearchService;
  let searchBarViewModel: SearchBarViewModel;

  function setUp() {
    searchService = new SearchService();
    searchBarViewModel = new SearchBarViewModel();
    searchService.doFuzzySearchPersons = jest.fn().mockImplementation(() => {
      return { terms: [], sortableModels: [{ id: 1 }] };
    });
    SearchService.getInstance = jest.fn().mockReturnValue(searchService);
    GroupService.getInstance.mockReturnValue(groupService);
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('getSectionItemSize()', () => {
    it('If calculateSectionCount < 1 should return ONLY_ONE_SECTION_LENGTH', () => {
      const num1 = searchBarViewModel.getSectionItemSize(1);
      const num2 = searchBarViewModel.getSectionItemSize(0);
      expect(num1).toBe(ONLY_ONE_SECTION_LENGTH);
      expect(num2).toBe(ONLY_ONE_SECTION_LENGTH);
    });
    it('If calculateSectionCount > 1 should return MORE_SECTION_LENGTH', () => {
      const num1 = searchBarViewModel.getSectionItemSize(2);
      const num2 = searchBarViewModel.getSectionItemSize(3);
      expect(num1).toBe(MORE_SECTION_LENGTH);
      expect(num2).toBe(MORE_SECTION_LENGTH);
    });
  });

  describe('hasMore()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('If sortableModels.length > needSliceNum should be true', () => {
      const hasMore = searchBarViewModel.hasMore(
        {
          sortableModels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        } as any,
        1,
      );
      expect(hasMore).toBe(true);
    });
    it('If sortableModels.length < needSliceNum should be false', () => {
      const hasMore = searchBarViewModel.hasMore(
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
      const section = searchBarViewModel.getSection(
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
      const section1 = searchBarViewModel.getSection(
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
      const section2 = searchBarViewModel.getSection(
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
      const section = searchBarViewModel.getSection(null, 0);
      expect(section).toEqual({
        ids: [],
        hasMore: false,
        models: [],
      });
    });
  });
  describe('calculateSectionCount()', () => {
    it('If persons and groups and teams length = 0 should return 0', () => {
      const existCount = searchBarViewModel.calculateSectionCount(
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
      const existCount1 = searchBarViewModel.calculateSectionCount(
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
      const existCount2 = searchBarViewModel.calculateSectionCount(
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
      const existCount3 = searchBarViewModel.calculateSectionCount(
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
      const existCount1 = searchBarViewModel.calculateSectionCount(
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
      const existCount2 = searchBarViewModel.calculateSectionCount(
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
      const existCount3 = searchBarViewModel.calculateSectionCount(
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
      const existCount = searchBarViewModel.calculateSectionCount(
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

  describe('setSearchResult()', () => {
    it('If search return null should be return', async () => {
      jest.spyOn(searchBarViewModel, 'search').mockReturnValue(null);
      const ret = await searchBarViewModel.setSearchResult('null');
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
      jest.spyOn(searchBarViewModel, 'search').mockReturnValue(resultData);
      jest.spyOn(searchBarViewModel, 'resetSelectIndex');
      await searchBarViewModel.setSearchResult('value');
      expect(searchBarViewModel.searchResult).toEqual([
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
      expect(searchBarViewModel.terms).toEqual(['a']);
      expect(searchBarViewModel.resetSelectIndex).toHaveBeenCalled();
    });
  });

  it('resetData()', () => {
    searchBarViewModel.resetSelectIndex();
    expect(searchBarViewModel.searchResult).toEqual([]);
    expect(searchBarViewModel.terms).toEqual([]);
    expect(searchBarViewModel.selectIndex).toEqual([-1, -1]);
  });

  describe('setCurrentResults()', () => {
    it('If data type is search should be set search result', () => {
      searchBarViewModel.setValue('123'); // this.dataType = DATA_TYPE.search
      const data = [
        {
          ids: [1, 2],
          type: RecentSearchTypes.PEOPLE,
          hasMore: false,
        },
      ];
      searchBarViewModel.setCurrentResults(data);
      expect(searchBarViewModel.searchResult).toEqual(data);
    });
    it('If data type is record should be set recent record', () => {
      // this.dataType = DATA_TYPE.recent
      const data = [
        {
          ids: [1, 2],
          types: [RecentSearchTypes.PEOPLE, RecentSearchTypes.PEOPLE],
        },
      ];
      searchBarViewModel.setCurrentResults(data);
      expect(searchBarViewModel.recentRecord).toEqual(data);
    });
  });

  it('setSelectIndex()', () => {
    searchBarViewModel.setSelectIndex(1, 1);
    expect(searchBarViewModel.selectIndex).toEqual([1, 1]);
  });

  describe('getCurrentItemId()', () => {
    it('If section < 0 should return null', () => {
      searchBarViewModel.setSelectIndex(-1, -1);
      expect(searchBarViewModel.getCurrentItemId()).toBe(null);
    });
    it('If section > 0 should return select id', () => {
      searchBarViewModel.setSelectIndex(0, 1);
      const data = [
        {
          ids: [1, 2],
          types: [RecentSearchTypes.PEOPLE, RecentSearchTypes.PEOPLE],
        },
      ];
      searchBarViewModel.setCurrentResults(data);
      expect(searchBarViewModel.getCurrentItemId()).toBe(2);
    });
  });

  describe('getCurrentItemType()', () => {
    it('If data type is search should be return type from section', () => {
      searchBarViewModel.setValue('123'); // this.dataType = DATA_TYPE.search
      searchBarViewModel.setSelectIndex(0, 0);
      const data = [
        {
          ids: [1, 2],
          type: RecentSearchTypes.PEOPLE,
          hasMore: false,
        },
      ];
      searchBarViewModel.setCurrentResults(data);
      expect(searchBarViewModel.getCurrentItemType()).toBe(
        RecentSearchTypes.PEOPLE,
      );
    });
    it('If data type is record should be return type from types', () => {
      searchBarViewModel.setSelectIndex(0, 1);
      const data = [
        {
          ids: [1, 2],
          types: [RecentSearchTypes.PEOPLE, RecentSearchTypes.GROUP],
        },
      ];
      searchBarViewModel.setCurrentResults(data);
      expect(searchBarViewModel.getCurrentItemType()).toBe(
        RecentSearchTypes.GROUP,
      );
    });
  });

  describe('currentResults()', () => {
    it('If data type is search should be return search result', () => {
      searchBarViewModel.setValue('123');
      expect(searchBarViewModel.currentResults()).toEqual(
        searchBarViewModel.searchResult,
      );
    });
    it('If data type is record should be return recent record', () => {
      expect(searchBarViewModel.currentResults()).toEqual(
        searchBarViewModel.recentRecord,
      );
    });
  });

  it('getRecent()', () => {
    const s = {
      getRecentSearchRecords: jest.fn().mockReturnValue([
        {
          value: 1,
          type: 'type',
        },
        {
          value: 'text',
          type: 'text',
        },
      ]),
    };
    jest.spyOn(SearchService, 'getInstance').mockImplementation(() => s);

    searchBarViewModel.getRecent();
    expect(searchBarViewModel.recentRecord).toEqual([
      {
        ids: [1, 'text'],
        types: ['type', 'text'],
      },
    ]);
  });

  it('addRecentRecord()', () => {
    const s = {
      addRecentSearchRecord: jest.fn(),
    };
    jest.spyOn(SearchService, 'getInstance').mockImplementation(() => s);
    jest
      .spyOn(searchBarViewModel, 'getCurrentItemType')
      .mockReturnValue('type');
    searchBarViewModel.addRecentRecord(1);
    expect(s.addRecentSearchRecord).toHaveBeenCalledWith('type', 1);
  });

  it('should be clear recent search records', () => {
    const s = {
      clearRecentSearchRecords: jest.fn(),
    };
    jest.spyOn(SearchService, 'getInstance').mockImplementation(() => s);
    searchBarViewModel.clearRecent();
    expect(s.clearRecentSearchRecords).toHaveBeenCalled();
  });
});
