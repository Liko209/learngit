/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-23 16:26:42
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { PersonService } from 'sdk/module/person';
import { GroupService } from 'sdk/module/group';
import { SearchService } from 'sdk/module/search';
import { RecentSearchModel, RecentSearchTypes } from 'sdk/module/search/entity';
import {
  SectionType,
  SortableModel,
  ViewProps,
  Person,
  Group,
  Props,
  SearchItems,
  RecentItems,
} from './types';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';
import storeManager from '@/store/base/StoreManager';

const ONLY_ONE_SECTION_LENGTH = 9;
const MORE_SECTION_LENGTH = 3;

const InvalidIndexPath: number[] = [-1, -1];

enum DATA_TYPE {
  search,
  recent,
}
class SearchBarViewModel extends StoreViewModel<Props> implements ViewProps {
  personService: PersonService;
  groupService: GroupService;
  @observable value: string = '';
  @observable focus: boolean = false;
  @observable recentRecord: RecentItems[] = [{ ids: [], types: [] }];

  @observable terms: string[] = [];
  @observable searchResult: SearchItems[] = [];
  @observable selectIndex: number[] = InvalidIndexPath;

  constructor() {
    super();
    this.personService = PersonService.getInstance<PersonService>();
    this.groupService = GroupService.getInstance();
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
      models: models || [],
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

    const personSection = this.getSection<Person>(persons, sectionCount);
    const groupSection = this.getSection<Group>(groups, sectionCount);
    const teamSection = this.getSection<Group>(teams, sectionCount);

    this.updateStore(
      personSection.models,
      groupSection.models,
      teamSection.models,
    );

    return {
      terms:
        (persons && persons.terms) ||
        (groups && groups.terms) ||
        (teams && teams.terms) ||
        [],
      people: personSection,
      groups: groupSection,
      teams: teamSection,
    };
  }

  setSearchResult = async (value: string) => {
    const ret = await this.search(value);
    if (!ret) {
      return;
    }

    const { terms, people, groups, teams } = ret;
    const data: SearchItems[] = [
      {
        ...people,
        type: RecentSearchTypes.PEOPLE,
      },
      {
        ...groups,
        type: RecentSearchTypes.GROUP,
      },
      {
        ...teams,
        type: RecentSearchTypes.TEAM,
      },
    ];
    this.searchResult = data;
    this.terms = terms;
    this.resetSelectIndex();
  }

  resetData = () => {
    this.searchResult = [];
    this.terms = [];
    this.resetSelectIndex();
  }

  resetSelectIndex = () => {
    this.selectIndex = InvalidIndexPath;
  }

  setCurrentResults = (data: SearchItems[] | RecentItems[]) => {
    switch (this.dataType) {
      case DATA_TYPE.search:
        this.searchResult = data as SearchItems[];
        break;
      case DATA_TYPE.recent:
        this.recentRecord = data as RecentItems[];
        break;
      default:
        break;
    }
  }

  setSelectIndex = (section: number, cellIndex: number) => {
    this.selectIndex = [section, cellIndex];
  }

  findNextValidSectionLength = (section: number, offset: number): number[] => {
    const data = this.currentResults();
    for (let i = section; i >= 0 && i < data.length; i += offset) {
      const { length } = (data[i] as SearchItems).ids;
      if (length > 0) {
        return [i, length];
      }
    }
    return InvalidIndexPath;
  }

  onKeyUp = () => {
    const [section, cell] = this.selectIndex;
    if (cell > 0) {
      this.setSelectIndex(section, cell - 1);
    } else {
      if (section > 0) {
        const [nextSection, sectionLength] = this.findNextValidSectionLength(
          section - 1,
          -1,
        );
        if (nextSection !== -1) {
          this.setSelectIndex(nextSection, sectionLength - 1);
        }
      }
    }
  }

  onKeyDown = () => {
    const [section, cell] = this.selectIndex;
    const data = this.currentResults();
    const currentSection = section < 0 ? 0 : section;
    const searchItem: SearchItems | RecentItems = data[currentSection];

    if (!searchItem) {
      return;
    }
    const currentSectionLength = searchItem.ids.length;
    if (cell < currentSectionLength - 1) {
      this.setSelectIndex(currentSection, cell + 1);
    } else {
      if (currentSection < data.length - 1) {
        const [nextSection] = this.findNextValidSectionLength(section + 1, 1);
        if (nextSection !== -1) {
          this.setSelectIndex(nextSection, 0);
        }
      }
    }
  }

  // if search item removed need update selectIndex
  selectIndexChange = (sectionIndex: number, cellIndex: number) => {
    const [section, cell] = this.selectIndex;
    let data = this.currentResults();
    data = data.slice(0);

    const items: SearchItems | RecentItems = data[sectionIndex];
    items.ids.splice(cellIndex, 1);

    this.setCurrentResults(data);
    // remove current select item
    if (sectionIndex === section && cell === cellIndex) {
      this.setSelectIndex(InvalidIndexPath[0], InvalidIndexPath[1]);
      return;
    }

    // remove before current select item
    if (sectionIndex === section && cellIndex < cell) {
      this.setSelectIndex(section, cell - 1);
    }
  }

  getCurrentItemId = () => {
    const [section, cell] = this.selectIndex;
    const list = this.currentResults();
    if (section < 0) {
      return null;
    }
    return list[section].ids[cell];
  }

  getCurrentItemType = () => {
    const [section, cell] = this.selectIndex;
    const list = this.currentResults();
    if (this.dataType === DATA_TYPE.search) {
      return (list as SearchItems[])[section].type;
    }
    return (list as RecentItems[])[section].types[cell];
  }

  currentResults() {
    return this.dataType === DATA_TYPE.search
      ? this.searchResult
      : this.recentRecord;
  }

  get dataType() {
    return this.value ? DATA_TYPE.search : DATA_TYPE.recent;
  }

  getRecent = () => {
    const result = SearchService.getInstance().getRecentSearchRecords();
    this.recentRecord = [
      {
        ids: result.map((item: RecentSearchModel) => item.value),
        types: result.map((item: RecentSearchModel) => item.type),
      },
    ];
  }

  addRecentRecord = (id: number) => {
    SearchService.getInstance().addRecentSearchRecord(
      this.getCurrentItemType(),
      id,
    );
  }

  clearRecent = () => {
    SearchService.getInstance().clearRecentSearchRecords();
  }

  updateStore(
    personModels: SortableModel<Person>[],
    groupModels: SortableModel<Group>[],
    teamModels: SortableModel<Group>[],
  ) {
    storeManager.dispatchUpdatedDataModels(
      ENTITY_NAME.PERSON,
      personModels.map((model: SortableModel<Person>) => model.entity),
    );
    storeManager.dispatchUpdatedDataModels(
      ENTITY_NAME.GROUP,
      groupModels.map((model: SortableModel<Group>) => model.entity),
    );
    storeManager.dispatchUpdatedDataModels(
      ENTITY_NAME.GROUP,
      teamModels.map((model: SortableModel<Group>) => model.entity),
    );
  }
}

export { SearchBarViewModel };
