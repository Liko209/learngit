/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-23 16:26:42
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import PersonService from 'sdk/service/person';
import GroupService from 'sdk/service/group';

class SearchBarViewModel extends StoreViewModel {
  personService: PersonService;
  groupService: GroupService;

  constructor() {
    super();
    this.personService = PersonService.getInstance();
    this.groupService = GroupService.getInstance();
  }

  search = async (key: string) => {
    const persons = await this.personService.doFuzzySearchPersons(key, true);
    const groups = await this.groupService.doFuzzySearchGroups(key);
    const teams = await this.groupService.doFuzzySearchTeams(key);
    console.log(key, persons, '----------result people');
    console.log(groups, '----------result group');
    console.log(teams, '----------result teams');
  }
}

export { SearchBarViewModel };
