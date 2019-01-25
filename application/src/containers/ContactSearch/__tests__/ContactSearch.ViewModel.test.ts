/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-12 15:19:44
 * Copyright © RingCentral. All rights reserved.
 */
import { ContactSearchViewModel } from '../ContactSearch.ViewModel';
import { PersonService } from 'sdk/module/person';

const personService = {
  doFuzzySearchPersons() {
    return {
      terms: [],
      sortableModels: [{ id: 2 }],
    };
  },
};

describe('ContactSearchVM', () => {
  it('fetchSearch', async () => {
    const contactSearchViewModel = new ContactSearchViewModel();
    const value = 'aaa';
    jest.spyOn(PersonService, 'getInstance').mockReturnValue(personService);
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
