/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-04 15:34:11
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../../../../store/utils';
import { MembersViewModel } from '../Members.ViewModel';
import SortableGroupMemberHandler from '@/store/handler/SortableGroupMemberHandler';
import { PersonService } from 'sdk/module/person';
import debounce from 'lodash/debounce';

jest.mock('../../../../../../../store/utils');

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

const personService = {
  doFuzzySearchPersons: jest.fn().mockResolvedValue(mockResult),
};
PersonService.getInstance = jest.fn().mockReturnValue(personService);

SortableGroupMemberHandler.createSortableGroupMemberHandler = jest
  .fn()
  .mockResolvedValue({
    getSortedGroupMembersIds: jest.fn().mockReturnValue(mockMembers),
  });

const props = {
  id: 1,
};
let vm: MembersViewModel;

describe('MemberListViewModel', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue(mockGroup);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    vm = new MembersViewModel(props);
  });

  describe('sortedAllMemberIds', () => {
    it('should be get sorted member ids when invoke service order [JPT-1263]', async () => {
      await vm.createSortableHandler();
      expect(vm.sortedAllMemberIds).toEqual(mockMembers);
    });
  });

  describe('doFuzzySearchPersons()', () => {
    it('should be invoke one count when use debounce [JPT-1263]', () => {
      vm.changeSearchInput = jest.fn();
      const _debounce = debounce(vm.changeSearchInput, 300);
      _debounce('a');
      _debounce('ab');
      jest.runAllTimers();
      expect(vm.changeSearchInput).toHaveBeenCalledTimes(1);
    });

    it('should be get mock result when invoke service fuzzy search interface [JPT-1263]', async () => {
      const result = await vm.handleSearch();
      expect(result).toEqual(mockResult);
    });
  });
});
