/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-23 16:26:42
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import PersonService from 'sdk/service/person';
import GroupService from 'sdk/service/group';

class SearchBarViewModel extends StoreViewModel {
  search = async (key: string) => {
    const personService: PersonService = PersonService.getInstance();
    const groupService: GroupService = GroupService.getInstance();
    const result1 = await personService.doFuzzySearchPersons(key, true);
    const result2 = await groupService.doFuzzySearchGroups(key);
    console.log(result1, '----------result people');
    console.log(result2, '----------result group');
  }
}

export { SearchBarViewModel };
