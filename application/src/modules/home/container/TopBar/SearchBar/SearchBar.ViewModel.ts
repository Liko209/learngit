/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-23 16:26:42
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { PersonService } from 'sdk/module/person';
import GroupService from 'sdk/service/group';
import { GroupService as NGroupService } from 'sdk/module/group';
import {
  SectionType,
  SortableModel,
  ViewProps,
  Person,
  Group,
  Props,
} from './types';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
const ONLY_ONE_SECTION_LENGTH = 9;
const MORE_SECTION_LENGTH = 3;

class SearchBarViewModel extends StoreViewModel<Props> implements ViewProps {
  personService: PersonService;
  groupService: GroupService;
  nGroupService: NGroupService;
  @observable value: string = '';
  @observable focus: boolean = false;

  constructor() {
    super();
    this.personService = PersonService.getInstance<PersonService>();
    this.groupService = GroupService.getInstance();
    this.nGroupService = new NGroupService();
  }

  updateFocus = (focus: boolean) => {
    this.focus = focus;
  }

  @computed
  get currentUserId() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  }

  @computed
  get searchValue() {
    return this.value;
  }

  isTeamOrGroup = (id: number) => {
    const type = GlipTypeUtil.extractTypeId(id);

    return (
      type === TypeDictionary.TYPE_ID_GROUP ||
      type === TypeDictionary.TYPE_ID_TEAM
    );
  }

  setValue = (value: string) => {
    this.value = value;
  }

  calculateSectionCount(
    persons: SectionType<Person>,
    groups: SectionType<Group>,
    teams: SectionType<Group>,
  ) {
    return [persons, groups, teams].reduce((prev, current) => {
      return current && current.sortableModels.length > 0 ? prev + 1 : prev;
    },                                     0);
  }

  getSectionItemSize(sectionCount: number) {
    return sectionCount <= 1 ? ONLY_ONE_SECTION_LENGTH : MORE_SECTION_LENGTH;
  }

  hasMore<T>(section: SectionType<T>, sectionCount: number) {
    return (
      (section &&
        section.sortableModels.length >
          this.getSectionItemSize(sectionCount)) ||
      false
    );
  }

  getSection<T>(section: SectionType<T>, sectionCount: number) {
    const models =
      section &&
      section.sortableModels.slice(0, this.getSectionItemSize(sectionCount));
    const ids = (models || []).map((model: SortableModel<T>) => model.id);
    return {
      ids,
      hasMore: this.hasMore<T>(section, sectionCount),
    };
  }

  search = async (key: string) => {
    if (!key) return;

    const [persons, groups, teams] = await Promise.all([
      this.personService.doFuzzySearchPersons(key, false),
      this.groupService.doFuzzySearchGroups(key),
      this.groupService.doFuzzySearchTeams(key),
    ]);
    const sectionCount = this.calculateSectionCount(persons, groups, teams);

    return {
      terms:
        (persons && persons.terms) ||
        (groups && groups.terms) ||
        (teams && teams.terms) ||
        [],
      people: this.getSection<Person>(persons, sectionCount),
      groups: this.getSection<Group>(groups, sectionCount),
      teams: this.getSection<Group>(teams, sectionCount),
    };
  }
}

export { SearchBarViewModel };
