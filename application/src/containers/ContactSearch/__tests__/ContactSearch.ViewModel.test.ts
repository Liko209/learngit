/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-12 15:19:44
 * Copyright © RingCentral. All rights reserved.
 */
import { ContactSearchViewModel } from '../ContactSearch.ViewModel';
import { service } from 'sdk';

const { SearchService } = service;
const searchService = {
  searchMembers() {
    return [{ id: 2 }];
  },
};

describe('ContactSearchVM', () => {
  it('fetchSearch', async () => {
    const contactSearchViewModel = new ContactSearchViewModel();
    const value = 'aaa';
    jest.spyOn(SearchService, 'getInstance').mockReturnValue(searchService);
    contactSearchViewModel.existMembers = [1];
    await expect(contactSearchViewModel.fetchSearch(value)).resolves.toEqual([
      { id: 2 },
    ]);
  });
  it('searchMembers with empty string', async () => {
    const contactSearchViewModel = new ContactSearchViewModel();
    const value = '';
    contactSearchViewModel.searchMembers(value);
    expect(contactSearchViewModel.suggestions).toEqual([]);
  });
});
