/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-04 15:34:11
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '@/store/utils';
import { MembersViewModel } from '../Members.ViewModel';
import SortableGroupMemberHandler from '@/store/handler/SortableGroupMemberHandler';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import debounce from 'lodash/debounce';

jest.mock('@/store/utils');
jest.mock('@/store/handler/SortableGroupMemberHandler');

jest.useFakeTimers();

const mockMembers = [1, 2, 3];

const mockResult = {
  terms: ['a', 'b'],
  sortableModels: [{ id: 1 }, { id: 2 }],
};

const mockGroup = {
  id: 1,
  members: mockMembers,
};

const searchService = {
  doFuzzySearchPersons: jest.fn().mockResolvedValue(mockResult),
};

const props = {
  id: 1,
};
let vm: MembersViewModel;

describe('MembersViewModel', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue(mockGroup);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    ServiceLoader.getInstance = jest.fn().mockReturnValue(searchService);
    SortableGroupMemberHandler.mockImplementation(() => ({
      sortedMemberIds: mockMembers,
    }));
    vm = new MembersViewModel(props);
  });

  describe('doFuzzySearchPersons()', () => {
    it.skip('should be invoke one count when use debounce [JPT-1263]', () => {
      vm.changeSearchInput = jest.fn();
      const _debounce = debounce(vm.changeSearchInput, 300);
      _debounce('a');
      _debounce('ab');
      jest.runAllTimers();
      expect(vm.changeSearchInput).toHaveBeenCalledTimes(1);
    });

    it('should be get mock result when invoke service fuzzy search interface [JPT-1263]', async () => {
      vm.keywords = 'any';
      const result = await vm.handleSearch();
      expect(result).toEqual(mockResult);
    });

    it('should use all ids as filtered ids [JPT-1263]', async () => {
      vm.keywords = '';
      await vm.handleSearch();
      expect(vm.filteredMemberIds.length).toEqual(mockMembers.length);
    });
  });
});
