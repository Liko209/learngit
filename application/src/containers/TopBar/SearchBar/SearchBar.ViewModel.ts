/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-23 16:26:42
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import PersonService from 'sdk/service/person';
import GroupService from 'sdk/service/group';
import { Person, Group, SortableModel } from 'sdk/src/models'; // eslint-disable-line

type SortableModels = SortableModel<Person>[] | SortableModel<Group>[] | null;

type SectionTypes = SectionType<Person> | SectionType<Group>;

type SectionType<T> = {
  terms: string[];
  sortableModels: SortableModel<T>[];
} | null;

class SearchBarViewModel extends StoreViewModel {
  personService: PersonService;
  groupService: GroupService;

  constructor() {
    super();
    this.personService = PersonService.getInstance();
    this.groupService = GroupService.getInstance();
  }

  private _getModels(
    preModels: SortableModels,
    current: SectionTypes,
    currentIndex: number,
  ) {
    return {
      sortableModels: preModels
        ? preModels
        : currentIndex === 0
        ? current!.sortableModels
        : null,
    };
  }

  private _filterExistSection(
    persons: SectionType<Person>,
    groups: SectionType<Group>,
    teams: SectionType<Group>,
  ) {
    const allSections = [persons, groups, teams];
    const defaultSection = {
      existNum: 0,
      persons: {
        sortableModels: null,
      },
      groups: {
        sortableModels: null,
      },
      teams: {
        sortableModels: null,
      },
    };

    return allSections.reduce((prev, current, currentIndex) => {
      if (current && current.sortableModels.length > 0) {
        const { existNum, persons, groups, teams } = prev;
        console.log(persons, '----------result allSections');
        console.log(groups, '----------result allSections');
        console.log(teams, '----------result allSections');
        return {
          existNum: existNum + 1,
          persons: this._getModels(
            persons.sortableModels,
            current,
            currentIndex,
          ),
          groups: this._getModels(groups.sortableModels, current, currentIndex),
          teams: this._getModels(teams.sortableModels, current, currentIndex),
        };
      }
      return prev;
    },                        defaultSection);
  }

  search = async (key: string) => {
    const [persons, groups, teams] = await Promise.all([
      this.personService.doFuzzySearchPersons(key, true),
      this.groupService.doFuzzySearchGroups(key),
      this.groupService.doFuzzySearchTeams(key),
    ]);

    console.log(key, persons, '----------result people');
    console.log(groups, '----------result group');
    console.log(teams, '----------result teams');
    const existSections = this._filterExistSection(persons, groups, teams);
    console.log(existSections, '-----result exist');

    return {
      persons,
      groups,
      teams,
    };
  }
}

export { SearchBarViewModel };
