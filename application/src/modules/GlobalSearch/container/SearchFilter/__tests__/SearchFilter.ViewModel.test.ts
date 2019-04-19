/*
 * @Author: ken.li
 * @Date: 2019-04-10 20:59:08
 * Copyright © RingCentral. All rights reserved.
 */
import moment from 'moment';
import { ESearchContentTypes } from 'sdk/api/glip/search';
import { TypeDictionary } from 'sdk/utils';

import { DATE_DICTIONARY } from '../types';
import { SearchFilterViewModel } from '../SearchFilter.ViewModel';
import { TYPE_MAP } from '../config';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('SearchFilterViewModel', () => {
  let searchFilterViewModel: SearchFilterViewModel;

  beforeEach(() => {
    clearMocks();
    searchFilterViewModel = new SearchFilterViewModel();
  });

  describe('handleSearchTypeChange [JPT-1579]', () => {
    it('should have been called with ESearchContentTypes', () => {
      const props = {
        setSearchOptions: jest.fn(),
        searchOptions: {},
      } as any;
      searchFilterViewModel = new SearchFilterViewModel(props);
      searchFilterViewModel.handleSearchTypeChange(ESearchContentTypes.ALL);
      expect(props.setSearchOptions).toHaveBeenCalledWith({
        type: ESearchContentTypes.ALL,
      });
    });

    it('should NOT have been called with ESearchContentTypes if select same type', () => {
      const props = {
        setSearchOptions: jest.fn(),
        searchOptions: { type: ESearchContentTypes.ALL },
      } as any;
      searchFilterViewModel = new SearchFilterViewModel(props);
      searchFilterViewModel.handleSearchTypeChange(ESearchContentTypes.ALL);
      expect(props.setSearchOptions).not.toHaveBeenCalledWith({
        type: ESearchContentTypes.ALL,
      });
    });
  });

  describe('handleSearchPostDateChange [JPT-1581]', () => {
    it('should have been called with time stamp', () => {
      const props = {
        setSearchOptions: jest.fn(),
        searchOptions: {},
      } as any;
      searchFilterViewModel = new SearchFilterViewModel(props);
      const TimeStamp = searchFilterViewModel.getTimeStamp(
        DATE_DICTIONARY.THIS_WEEK,
      );
      searchFilterViewModel.handleSearchPostDateChange(
        DATE_DICTIONARY.THIS_WEEK,
      );
      expect(props.setSearchOptions).toHaveBeenCalledWith({
        begin_time: TimeStamp,
      });
    });

    it('should not have been called with time stamp if date is undefined', () => {
      const props = {
        setSearchOptions: jest.fn(),
        searchOptions: {},
      } as any;
      searchFilterViewModel = new SearchFilterViewModel(props);
      const TimeStamp = searchFilterViewModel.getTimeStamp(
        DATE_DICTIONARY.ANY_TIME,
      );
      searchFilterViewModel.handleSearchPostDateChange(
        DATE_DICTIONARY.ANY_TIME,
      );
      expect(props.setSearchOptions).not.toHaveBeenCalledWith({
        begin_time: TimeStamp,
      });
    });

    it('should not have been called with time stamp if date is same', () => {
      const props = {
        setSearchOptions: jest.fn(),
        searchOptions: { items: DATE_DICTIONARY.ANY_TIME },
      } as any;
      searchFilterViewModel = new SearchFilterViewModel(props);
      const TimeStamp = searchFilterViewModel.getTimeStamp(
        DATE_DICTIONARY.ANY_TIME,
      );
      searchFilterViewModel.handleSearchPostDateChange(
        DATE_DICTIONARY.ANY_TIME,
      );
      expect(props.setSearchOptions).not.toHaveBeenCalledWith({
        begin_time: TimeStamp,
      });
    });
  });

  describe('get timePeriodFilter', () => {
    it('4 items should show in the drop down list', () => {
      const item = [
        { id: DATE_DICTIONARY.ANY_TIME, value: 'Anytime' },
        { id: DATE_DICTIONARY.THIS_WEEK, value: 'ThisWeek' },
        { id: DATE_DICTIONARY.THIS_MONTH, value: 'ThisMonth' },
        { id: DATE_DICTIONARY.THIS_YEAR, value: 'ThisYear' },
      ];
      expect(searchFilterViewModel.timePeriodFilter).toEqual(item);
    });
  });

  describe('getContentsCount [JPT-1579]', () => {
    it('should be return null', () => {
      const props = {
        contentsCount: {
          1: 1,
          2: 2,
        },
      } as any;
      searchFilterViewModel = new SearchFilterViewModel(props);
      expect(searchFilterViewModel.getContentsCount('')).toEqual(null);
    });
    it('exist', () => {
      const props = {
        contentsCount: {
          1: 1,
          2: 2,
        },
      } as any;
      searchFilterViewModel = new SearchFilterViewModel(props);
      expect(searchFilterViewModel.getContentsCount(1)).toBe(1);
    });
    it('should be 0', () => {
      const props = {
        contentsCount: {
          1: 1,
          2: 2,
        },
      } as any;
      searchFilterViewModel = new SearchFilterViewModel(props);
      expect(searchFilterViewModel.getContentsCount(3)).toBe(0);
    });
  });

  describe('get typeFilter [JPT-1579]', () => {
    it('should return 7 items', () => {
      const countMap = {
        '': 100,
        [TypeDictionary.TYPE_ID_POST]: 1,
        [TypeDictionary.TYPE_ID_EVENT]: 2,
        [TypeDictionary.TYPE_ID_FILE]: 3,
        [TypeDictionary.TYPE_ID_LINK]: 4,
        [TypeDictionary.TYPE_ID_PAGE]: 5,
        [TypeDictionary.TYPE_ID_TASK]: 6,
      };
      jest
        .spyOn(searchFilterViewModel, 'getContentsCount')
        .mockImplementation((id: number) => countMap[id]);
      const contentTypeItems = TYPE_MAP.map((item: any) => {
        return {
          ...item,
          count: countMap[item.id],
        };
      });
      expect(searchFilterViewModel.typeFilter).toEqual(contentTypeItems);
    });
  });

  describe('getTimeStamp [JPT-1581]', () => {
    it('should return null', () => {
      expect(
        searchFilterViewModel.getTimeStamp(DATE_DICTIONARY.ANY_TIME),
      ).toEqual(null);
    });
    it('should return start of week timeStamp', () => {
      expect(
        searchFilterViewModel.getTimeStamp(DATE_DICTIONARY.THIS_WEEK),
      ).toEqual(
        moment()
          .startOf('week')
          .valueOf(),
      );
    });
    it('should return start of month timeStamp', () => {
      expect(
        searchFilterViewModel.getTimeStamp(DATE_DICTIONARY.THIS_MONTH),
      ).toEqual(
        moment()
          .startOf('month')
          .valueOf(),
      );
    });
    it('should return start of month timeStamp', () => {
      expect(
        searchFilterViewModel.getTimeStamp(DATE_DICTIONARY.THIS_YEAR),
      ).toEqual(
        moment()
          .startOf('year')
          .valueOf(),
      );
    });
  });
});
