/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-26 20:32:51
 * Copyright © RingCentral. All rights reserved.
 */
import { service } from 'sdk';
import { JServerError, ERROR_CODES_SERVER } from 'sdk/error';
import { GroupService as NGroupService } from 'sdk/module/group';
import { Notification } from '@/containers/Notification';
import { getGlobalValue } from '../../../../store/utils';
import { SearchBarViewModel } from '../SearchBar.ViewModel';
jest.mock('../../../../store/utils');
jest.mock('@/containers/Notification');

jest.mock('sdk/api');
jest.mock('sdk/dao', () => jest.fn());

jest.mock('sdk/module/group', () => ({
  GroupService: jest.fn(),
}));

const searchBarViewModel = new SearchBarViewModel();
const { PersonService, GroupService } = service;

const ONLY_ONE_SECTION_LENGTH = 9;
const MORE_SECTION_LENGTH = 3;

const personService = {
  doFuzzySearchPersons() {
    return { terms: [], sortableModels: [{ id: 1 }] };
  },
};

const groupService = {
  doFuzzySearchGroups() {
    return { terms: [], sortableModels: [{ id: 2 }] };
  },
  doFuzzySearchTeams() {
    return { terms: [], sortableModels: [{ id: 3 }] };
  },
};

describe('SearchBarViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(PersonService, 'getInstance').mockReturnValue(personService);
    jest.spyOn(GroupService, 'getInstance').mockReturnValue(groupService);
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
    it('Should return section', () => {
      const section = searchBarViewModel.getSection(
        {
          sortableModels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        } as any,
        1,
      );
      expect(section).toEqual({
        sortableModel: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        hasMore: true,
      });
      const section1 = searchBarViewModel.getSection(
        {
          sortableModels: [1, 2, 3, 4, 5],
        } as any,
        2,
      );
      expect(section1).toEqual({
        sortableModel: [1, 2, 3],
        hasMore: true,
      });
      const section2 = searchBarViewModel.getSection(
        {
          sortableModels: [1, 2],
        } as any,
        2,
      );
      expect(section2).toEqual({
        sortableModel: [1, 2],
        hasMore: false,
      });
    });
    it('Should be empty array', () => {
      const section = searchBarViewModel.getSection(null, 0);
      expect(section).toEqual({
        sortableModel: [],
        hasMore: false,
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

  // describe('search()', async () => {
  //   // jest.spyOn(searchBarViewModel, 'calculateSectionCount');
  //   // jest.spyOn(searchBarViewModel, 'getSection');
  //   const ret = await searchBarViewModel.search('123');
  //   expect(searchBarViewModel.calculateSectionCount).toHaveBeenCalledWith(
  //     { terms: [], sortableModels: [{ id: 1 }] },
  //     { terms: [], sortableModels: [{ id: 2 }] },
  //     { terms: [], sortableModels: [{ id: 3 }] },
  //   );
  //   expect(searchBarViewModel.getSection).toHaveBeenCalledTimes(3);
  //   expect(ret).toEqual({
  //     terms: [],
  //     persons: {
  //       sortableModel: [{ id: 1 }],
  //       hasMore: false,
  //     },
  //     groups: {
  //       sortableModel: [{ id: 2 }],
  //       hasMore: false,
  //     },
  //     teams: {
  //       sortableModel: [{ id: 3 }],
  //       hasMore: false,
  //     },
  //   });
  // });
});
