/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-12 15:19:44
 * Copyright © RingCentral. All rights reserved.
 */
import { ContactSearchViewModel } from '../ContactSearch.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';

const searchService = {
  doFuzzySearchPersons() {
    return {
      terms: [],
      sortableModels: [{ id: 2 }],
    };
  },
};

describe('ContactSearchVM', () => {
  describe('fetchPersons', () => {
    it('List shows/no shows if enter text matched/no matched any contact in posted by input filed [JPT-1554]', async () => {
      const contactSearchViewModel = new ContactSearchViewModel();
      const value = 'aaa';
      ServiceLoader.getInstance = jest.fn().mockReturnValue(searchService);
      contactSearchViewModel.existMembers = [1];
      await expect(contactSearchViewModel.fetchPersons(value)).resolves.toEqual(
        [{ id: 2 }],
      );
    });
    it('searchMembers with empty string', async () => {
      const contactSearchViewModel = new ContactSearchViewModel();
      const value = '';
      contactSearchViewModel.searchMembers(value);
      expect(contactSearchViewModel.suggestions).toEqual([]);
    });
  });
});
