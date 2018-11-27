/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-23 16:26:42
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import PersonService from 'sdk/service/person';
import GroupService from 'sdk/service/group';
import { Person, Group } from 'sdk/src/models';
import { SectionTypes, SectionType } from './types';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';

const ONLY_ONE_SECTION_LENGTH = 9;
const MORE_SECTION_LENGTH = 3;

class SearchBarViewModel extends StoreViewModel {
  personService: PersonService;
  groupService: GroupService;
  @observable value: string = '';

  constructor() {
    super();
    this.personService = PersonService.getInstance();
    this.groupService = GroupService.getInstance();
  }

  @computed
  get currentUserId() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  }

  @computed
  get searchValue() {
    return this.value;
  }

  setValue = (value: string) => {
    this.value = value;
  }

  existSectionNum(
    persons: SectionType<Person>,
    groups: SectionType<Group>,
    teams: SectionType<Group>,
  ) {
    return [persons, groups, teams].reduce((prev, current, currentIndex) => {
      return current && current.sortableModels.length > 0 ? prev + 1 : prev;
    },                                     0);
  }

  needSliceNum(existSectionNum: number) {
    return existSectionNum <= 1 ? ONLY_ONE_SECTION_LENGTH : MORE_SECTION_LENGTH;
  }

  hasMore(section: SectionTypes, existSectionNum: number) {
    return (
      (section &&
        section.sortableModels.length > this.needSliceNum(existSectionNum)) ||
      false
    );
  }

  getSection(section: SectionTypes, existSectionNum: number) {
    return {
      sortableModel:
        (section &&
          section.sortableModels.slice(
            0,
            this.needSliceNum(existSectionNum),
          )) ||
        [],
      hasMore: this.hasMore(section, existSectionNum),
    };
  }

  search = async (key: string) => {
    const [persons, groups, teams] = await Promise.all([
      this.personService.doFuzzySearchPersons(key, true),
      this.groupService.doFuzzySearchGroups(key),
      this.groupService.doFuzzySearchTeams(key),
    ]);
    const existSectionNum = this.existSectionNum(persons, groups, teams);

    return {
      terms:
        (persons && persons.terms) ||
        (groups && groups.terms) ||
        (teams && teams.terms) ||
        [],
      persons: this.getSection(persons, existSectionNum),
      groups: this.getSection(groups, existSectionNum),
      teams: this.getSection(teams, existSectionNum),
    };
  }
}

export { SearchBarViewModel };
