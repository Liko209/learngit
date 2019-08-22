/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-12 15:19:44
 * Copyright © RingCentral. All rights reserved.
 */
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { getEntity } from '@/store/utils';
import { GroupSearchViewModel } from '../GroupSearch.ViewModel';

jest.mock('@/store/utils');

const searchService = {
  doFuzzySearchAllGroups() {
    return {
      terms: [],
      sortableModels: [{ id: 3 }],
    };
  },
};

const props = {
  label: '',
  placeholder: '',
};

describe('GroupSearchVM', () => {
  describe('fetchGroups', () => {
    it('List shows/no if enter text matched/no matched any team conversation in posted in input filed [JPT-1555]', async () => {
      const groupSearchViewModel = new GroupSearchViewModel(props);
      let value = 'aaa';
      ServiceLoader.getInstance = jest.fn().mockReturnValue(searchService);
      await expect(groupSearchViewModel.fetchGroups(value)).resolves.toEqual([
        { id: 3 },
      ]);
      value = '';
      groupSearchViewModel.searchGroups(value);
      expect(groupSearchViewModel.suggestions).toEqual([]);
    });
    it('Check the search list of the post in when searching message in a conversation [JPT-1636]', async () => {
      const members = [1, 2, 3];
      const displayName = 'aaa';
      (getEntity as jest.Mock).mockReturnValue({
        members,
        displayName,
      });
      const groupSearchViewModel = new GroupSearchViewModel(
        Object.assign(props, { groupId: 6 }),
      );

      expect(groupSearchViewModel.selectedItems).toEqual([
        {
          id: 6,
          label: displayName,
          email: displayName,
        },
      ]);
    });
  });
});
