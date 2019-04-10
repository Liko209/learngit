/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-12 15:19:44
 * Copyright © RingCentral. All rights reserved.
 */
import { ContactSearchViewModel } from '../ContactSearch.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { getEntity } from '@/store/utils';
import { ContactSearchType } from '../types';

jest.mock('@/store/utils');

const searchService = {
  doFuzzySearchPersons() {
    return {
      terms: [],
      sortableModels: [{ id: 2 }],
    };
  },
};

const groupService = {
  doFuzzySearchALlGroups() {
    return {
      terms: [],
      sortableModels: [{ id: 3 }],
    };
  },
};

const props = {
  type: ContactSearchType.PERSON,
  label: '',
  placeholder: '',
};

describe('ContactSearchVM', () => {
  describe('fetchPersons', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('List shows/no shows if enter text matched/no matched any contact in posted by input filed [JPT-1554]', async () => {
      const contactSearchViewModel = new ContactSearchViewModel(props);
      let value = 'aaa';
      ServiceLoader.getInstance = jest.fn().mockReturnValue(searchService);
      contactSearchViewModel.existMembers = [1];
      await expect(contactSearchViewModel.fetchPersons(value)).resolves.toEqual(
        [{ id: 2 }],
      );
      value = '';
      contactSearchViewModel.searchMembers(value);
      expect(contactSearchViewModel.suggestions).toEqual([]);
    });
    it('Check the search list of the post by when searching message in a conversation [JPT-1635]', async () => {
      const members = [1, 2, 3];
      (getEntity as jest.Mock).mockReturnValue({
        members,
        displayName: 'aaa',
      });
      const contactSearchViewModel = new ContactSearchViewModel(
        Object.assign(props, { groupId: 5 }),
      );

      expect(contactSearchViewModel.groupMembers).toEqual(members);
    });
  });
  describe('fetchGroups', () => {
    it('List shows/no if enter text matched/no matched any team conversation in posted in input filed [JPT-1555]', async () => {
      const contactSearchViewModel = new ContactSearchViewModel(
        Object.assign(props, { type: ContactSearchType.GROUP }),
      );
      let value = 'aaa';
      ServiceLoader.getInstance = jest.fn().mockReturnValue(groupService);
      await expect(contactSearchViewModel.fetchGroups(value)).resolves.toEqual([
        { id: 3 },
      ]);
      value = '';
      contactSearchViewModel.searchGroups(value);
      expect(contactSearchViewModel.suggestions).toEqual([]);
    });
    it('Check the search list of the post in when searching message in a conversation [JPT-1636]', async () => {
      const members = [1, 2, 3];
      const displayName = 'aaa';
      (getEntity as jest.Mock).mockReturnValue({
        members,
        displayName,
      });
      const contactSearchViewModel = new ContactSearchViewModel(
        Object.assign(props, { groupId: 6 }),
      );

      expect(contactSearchViewModel.initialSelectedItem).toEqual({
        id: 6,
        label: displayName,
        email: displayName,
      });
    });
  });
});
