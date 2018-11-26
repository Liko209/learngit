/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-26 20:32:51
 * Copyright © RingCentral. All rights reserved.
 */
import { service } from 'sdk';
import { SearchBarViewModel } from '../SearchBar.ViewModel';

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
  describe('test needSliceNum()', () => {
    it('If existSectionNum < 1 should return ONLY_ONE_SECTION_LENGTH', () => {
      const num1 = searchBarViewModel.needSliceNum(1);
      const num2 = searchBarViewModel.needSliceNum(0);
      expect(num1).toBe(ONLY_ONE_SECTION_LENGTH);
      expect(num2).toBe(ONLY_ONE_SECTION_LENGTH);
    });
    it('If existSectionNum > 1 should return MORE_SECTION_LENGTH', () => {
      const num1 = searchBarViewModel.needSliceNum(2);
      const num2 = searchBarViewModel.needSliceNum(3);
      expect(num1).toBe(MORE_SECTION_LENGTH);
      expect(num2).toBe(MORE_SECTION_LENGTH);
    });
  });
  describe('test hasMore()', () => {
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
  describe('test getSection()', () => {
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
  describe('test existSectionNum()', () => {
    it('If persons and groups and teams length = 0 should return 0', () => {
      const existNum = searchBarViewModel.existSectionNum(
        {
          sortableModels: [],
        } as SectionType,
        {
          sortableModels: [],
        } as SectionType,
        {
          sortableModels: [],
        } as SectionType,
      );
      expect(existNum).toBe(0);
    });
    it('If only one section exist should return 1', () => {
      const existNum1 = searchBarViewModel.existSectionNum(
        {
          sortableModels: [1],
        } as SectionType,
        {
          sortableModels: [],
        } as SectionType,
        {
          sortableModels: [],
        } as SectionType,
      );
      expect(existNum1).toBe(1);
      const existNum2 = searchBarViewModel.existSectionNum(
        {
          sortableModels: [],
        } as SectionType,
        {
          sortableModels: [1],
        } as SectionType,
        {
          sortableModels: [],
        } as SectionType,
      );
      expect(existNum2).toBe(1);
      const existNum3 = searchBarViewModel.existSectionNum(
        {
          sortableModels: [],
        } as SectionType,
        {
          sortableModels: [],
        } as SectionType,
        {
          sortableModels: [1],
        } as SectionType,
      );
      expect(existNum3).toBe(1);
    });
    it('If has two sections should return 2', () => {
      const existNum1 = searchBarViewModel.existSectionNum(
        {
          sortableModels: [1],
        } as SectionType,
        {
          sortableModels: [1],
        } as SectionType,
        {
          sortableModels: [],
        } as SectionType,
      );
      expect(existNum1).toBe(2);
      const existNum2 = searchBarViewModel.existSectionNum(
        {
          sortableModels: [1],
        } as SectionType,
        {
          sortableModels: [],
        } as SectionType,
        {
          sortableModels: [1],
        } as SectionType,
      );
      expect(existNum2).toBe(2);
      const existNum3 = searchBarViewModel.existSectionNum(
        {
          sortableModels: [],
        } as SectionType,
        {
          sortableModels: [1],
        } as SectionType,
        {
          sortableModels: [1],
        } as SectionType,
      );
      expect(existNum3).toBe(2);
    });
    it('If has three sections should return 3', () => {
      const existNum = searchBarViewModel.existSectionNum(
        {
          sortableModels: [1],
        } as SectionType,
        {
          sortableModels: [1],
        } as SectionType,
        {
          sortableModels: [1],
        } as SectionType,
      );
      expect(existNum).toBe(3);
    });
  });

  describe('test search()', async () => {
    // jest.spyOn(searchBarViewModel, 'existSectionNum');
    // jest.spyOn(searchBarViewModel, 'getSection');
    const ret = await searchBarViewModel.search('123');
    expect(searchBarViewModel.existSectionNum).toHaveBeenCalledWith(
      { terms: [], sortableModels: [{ id: 1 }] },
      { terms: [], sortableModels: [{ id: 2 }] },
      { terms: [], sortableModels: [{ id: 3 }] },
    );
    expect(searchBarViewModel.getSection).toHaveBeenCalledTimes(3);
    expect(ret).toEqual({
      terms: [],
      persons: {
        sortableModel: [{ id: 1 }],
        hasMore: false,
      },
      groups: {
        sortableModel: [{ id: 2 }],
        hasMore: false,
      },
      teams: {
        sortableModel: [{ id: 3 }],
        hasMore: false,
      },
    });
  });
});
