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
  get searchValue() {
    return this.value;
  }

  setValue = (value: string) => {
    this.value = value;
  }

  private _existSectionNum(
    persons: SectionType<Person>,
    groups: SectionType<Group>,
    teams: SectionType<Group>,
  ) {
    return [persons, groups, teams].reduce((prev, current, currentIndex) => {
      return current && current.sortableModels.length > 0 ? prev + 1 : prev;
    },                                     0);
  }

  private _needSliceNum(existSectionNum: number) {
    return existSectionNum < 1 ? ONLY_ONE_SECTION_LENGTH : MORE_SECTION_LENGTH;
  }

  private _hasMore(section: SectionTypes, existSectionNum: number) {
    return (
      section &&
      section.sortableModels.length > this._needSliceNum(existSectionNum)
    );
  }

  private _getSection(section: SectionTypes, existSectionNum: number) {
    return {
      sortableModel:
        (section &&
          section.sortableModels.slice(
            0,
            this._needSliceNum(existSectionNum),
          )) ||
        [],
      hasMore: this._hasMore(section, existSectionNum),
    };
  }

  search = async (key: string) => {
    const [persons, groups, teams] = await Promise.all([
      this.personService.doFuzzySearchPersons(key, true),
      this.groupService.doFuzzySearchGroups(key),
      this.groupService.doFuzzySearchTeams(key),
    ]);
    const existSectionNum = this._existSectionNum(persons, groups, teams);

    return {
      terms:
        (persons && persons.terms) ||
        (groups && groups.terms) ||
        (teams && teams.terms) ||
        [],
      persons: this._getSection(persons, existSectionNum),
      groups: this._getSection(groups, existSectionNum),
      teams: this._getSection(teams, existSectionNum),
    };
  }
}

export { SearchBarViewModel };
