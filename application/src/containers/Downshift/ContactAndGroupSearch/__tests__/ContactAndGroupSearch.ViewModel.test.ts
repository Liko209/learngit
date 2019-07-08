/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-12 15:19:44
 * Copyright © RingCentral. All rights reserved.
 */
import { ContactAndGroupSearchViewModel } from '../ContactAndGroupSearch.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { getEntity } from '@/store/utils';

jest.mock('@/store/utils');

const searchService = {
  doFuzzySearchPersons() {
    return {
      terms: [],
      sortableModels: [{ id: 2 }],
    };
  },
  doFuzzySearchPersonsAndGroups() {
    return {
      terms: [],
      sortableModels: [{ id: 2 }],
    };
  },
};

const props = {
  label: '',
  placeholder: '',
};

describe('ContactSearchVM', () => {
  describe('fetchPersons', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('List shows/no shows if enter text matched/no matched any contact in posted by input filed [JPT-1554]', async () => {
      const contactAndGroupSearchViewModel = new ContactAndGroupSearchViewModel(
        props,
      );
      let value = 'aaa';
      ServiceLoader.getInstance = jest.fn().mockReturnValue(searchService);
      contactAndGroupSearchViewModel.existMembers = [1];
      await expect(
        contactAndGroupSearchViewModel.fetchPersons(value),
      ).resolves.toEqual([{ id: 2 }]);
      value = '';
      contactAndGroupSearchViewModel.searchMembers(value);
      expect(contactAndGroupSearchViewModel.suggestions).toEqual([]);
    });
    it('Check the search list of the post by when searching message in a conversation [JPT-1635]', async () => {
      const members = [1, 2, 3];
      (getEntity as jest.Mock).mockReturnValue({
        members,
        displayName: 'aaa',
      });
      const contactAndGroupSearchViewModel = new ContactAndGroupSearchViewModel(
        Object.assign(props, { groupId: 5 }),
      );

      expect(contactAndGroupSearchViewModel.groupMembers).toEqual(members);
    });
  });
  describe('_setSelectedItems()', () => {
    it('group members should be empty if there is no group Id', async () => {
      const members = [1, 2, 3];
      (getEntity as jest.Mock).mockReturnValue({
        members,
        displayName: 'aaa',
      });
      const contactAndGroupSearchViewModel = new ContactAndGroupSearchViewModel(
        Object.assign(props, { groupId: null }),
      );
      contactAndGroupSearchViewModel._setSelectedItems();
      expect(contactAndGroupSearchViewModel.groupMembers).toEqual([]);
    });
  });
});
