/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:49:32
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, action, comparer } from 'mobx';
import { container } from 'framework/ioc';
import storeManager from '@/store/base/StoreManager';
import { SearchService } from 'sdk/module/search';
import { GroupService } from 'sdk/module/group';
import { ENTITY_NAME, GLOBAL_KEYS } from '@/store/constants';
import { getEntity, getGlobalValue } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import history from '@/history';
import { debounce } from 'lodash';

import { changeToRecordTypes } from '../common/changeTypes';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { GlobalSearchService } from '../../service';
import { GlobalSearchStore } from '../../store';
import {
  InstantSearchProps,
  InstantSearchViewProps,
  SectionType,
  SortableModel,
  Person,
  Group,
  SearchItems,
  SEARCH_SCOPE,
  TAB_TYPE,
  SEARCH_VIEW,
  SearchItemTypes,
} from './types';
import { SearchViewModel } from '../common/Search.ViewModel';
import { toSearchContent } from '../common/toSearchContent';

const ONLY_ONE_SECTION_LENGTH = 9;
const MORE_SECTION_LENGTH = 3;
const SEARCH_DELAY = 50;

const InvalidIndexPath: number[] = [-1, -1];
const DefaultIndexPath: number[] = [0, 0];

class InstantSearchViewModel extends SearchViewModel<InstantSearchProps>
  implements InstantSearchViewProps {
  @observable terms: string[] = [];
  @observable searchResult: SearchItems[] = [];
  @observable selectIndex: number[] = DefaultIndexPath;
  private _globalSearchStore: GlobalSearchStore = container.get(
    GlobalSearchStore,
  );
  private _debounceSearch: Function;

  constructor() {
    super();
    this._debounceSearch = debounce(this.setSearchResult, SEARCH_DELAY);

    this.reaction(
      () => ({
        searchKey: this._globalSearchStore.searchKey,
        open: this._globalSearchStore.open,
      }),
      ({ searchKey, open }: { searchKey: string; open: boolean }) => {
        this._debounceSearch(searchKey);
        if (!open) {
          this.resetData();
        }
      },
      {
        fireImmediately: true,
        equals: comparer.structural,
      },
    );
  }

  canJoinTeam(id: number) {
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, id);
    const { isMember, isTeam, privacy } = group;
    return {
      group,
      canJoin: !!(isTeam && privacy === 'protected' && !isMember),
    };
  }

  @action
  onClear = () => {
    this._globalSearchStore.clearSearchKey();
  };

  @action
  onClose = () => {
    container.get(GlobalSearchService).closeGlobalSearch();
  };

  calculateSectionCount(
    persons: SectionType<Person>,
    groups: SectionType<Group>,
    teams: SectionType<Group>,
  ) {
    return [persons, groups, teams].reduce((prev, current) => {
      return current && current.sortableModels.length > 0 ? prev + 1 : prev;
    }, 0);
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

  @action
  search = async (key: string) => {
    if (!key) return;

    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );

    const searchService = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );

    const [persons, groups, teams] = await Promise.all([
      searchService.doFuzzySearchPersons(key, {
        excludeSelf: false,
        recentFirst: true,
      }),
      groupService.doFuzzySearchGroups(key, undefined, true),
      groupService.doFuzzySearchTeams(key, undefined, true),
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
  };

  @action
  setSearchResult = async (value: string) => {
    const ret = await this.search(value);
    if (!ret) {
      return;
    }
    const { terms, people, groups, teams } = ret;

    const data: SearchItems[] = [
      {
        ids: this.contentSearchIds,
        hasMore: false,
        type: SearchItemTypes.CONTENT,
      },
      {
        ...people,
        type: SearchItemTypes.PEOPLE,
      },
      {
        ...groups,
        type: SearchItemTypes.GROUP,
      },
      {
        ...teams,
        type: SearchItemTypes.TEAM,
      },
    ];
    this.searchResult = data;
    this.terms = terms;
    this.setSelectIndexToDefault();
  };

  get contentSearchIds() {
    const { searchKey } = this._globalSearchStore;
    return this._isConversation ? [searchKey, searchKey] : [searchKey];
  }

  private get _isConversation() {
    const { location } = history;
    const conversationPath = /messages\/\d+$/;
    return conversationPath.test(location.pathname);
  }

  getSearchScope = (index: number) => {
    const scope = {
      [SEARCH_SCOPE.GLOBAL]: SEARCH_SCOPE.GLOBAL,
      [SEARCH_SCOPE.CONVERSATION]: SEARCH_SCOPE.CONVERSATION,
    };
    return scope[index];
  };

  @action
  resetData = () => {
    this.searchResult = [];
    this.terms = [];
    this.resetSelectIndex();
  };

  @action
  resetSelectIndex = () => {
    this.selectIndex = InvalidIndexPath;
  };

  @action
  setSelectIndexToDefault = () => {
    this.selectIndex = DefaultIndexPath;
  };

  @action
  setSelectIndex = (section: number, cellIndex: number) => {
    this.selectIndex = [section, cellIndex];
  };

  findNextValidSectionLength = (section: number, offset: number): number[] => {
    const data = this.searchResult;
    for (let i = section; i >= 0 && i < data.length; i += offset) {
      const { length } = (data[i] as SearchItems).ids;
      if (length > 0) {
        return [i, length];
      }
    }
    return InvalidIndexPath;
  };

  get currentItemId() {
    const [section, cell] = this.selectIndex;
    const list = this.searchResult;
    if (section < 0) {
      return null;
    }
    return list[section].ids[cell];
  }

  get currentItemType() {
    const [section] = this.selectIndex;
    const list = this.searchResult;
    return (list as SearchItems[])[section].type;
  }

  addRecentRecord = (value: number | string) => {
    const type = changeToRecordTypes(this.currentItemType);
    const searchService = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );

    if (typeof value === 'number') {
      searchService.addRecentSearchRecord(type, value);
      return;
    }

    const cellIndex = this.selectIndex[1];
    const scope = this.getSearchScope(cellIndex);
    const conversationId = getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);
    searchService.addRecentSearchRecord(
      type,
      value,
      scope === SEARCH_SCOPE.CONVERSATION ? { groupId: conversationId } : {},
    );
  };

  @action
  onKeyUp = () => {
    const [section, cell] = this.selectIndex;

    if (cell > 0) {
      this.setSelectIndex(section, cell - 1);
      return;
    }

    if (section <= 0) {
      return;
    }

    const [nextSection, sectionLength] = this.findNextValidSectionLength(
      section - 1,
      -1,
    );
    if (nextSection !== -1) {
      this.setSelectIndex(nextSection, sectionLength - 1);
    }
  };

  @action
  onKeyDown = () => {
    const [section, cell] = this.selectIndex;
    const data = this.searchResult;
    const currentSection = section < 0 ? 0 : section;
    const searchItem: SearchItems = data[currentSection];

    if (!searchItem) {
      return;
    }

    const currentSectionLength = searchItem.ids.length;
    if (cell < currentSectionLength - 1) {
      this.setSelectIndex(currentSection, cell + 1);
      return;
    }

    if (currentSection >= data.length - 1) {
      return;
    }

    const [nextSection] = this.findNextValidSectionLength(section + 1, 1);
    if (nextSection !== -1) {
      this.setSelectIndex(nextSection, 0);
    }
  };

  @action
  onEnter = (e: KeyboardEvent) => {
    const selectIndex = this.selectIndex;
    if (selectIndex[0] < 0) {
      return;
    }

    const currentItemValue = this.currentItemId;
    const currentItemType = this.currentItemType;

    if (!currentItemValue) {
      return;
    }
    let cellIndex;
    let scope;
    switch (currentItemType) {
      case SearchItemTypes.PEOPLE:
        this.goToConversation(currentItemValue as number);
        break;
      case SearchItemTypes.CONTENT:
        cellIndex = this.selectIndex[1];
        scope = this.getSearchScope(cellIndex);
        toSearchContent(scope === SEARCH_SCOPE.CONVERSATION);
        break;
      case SearchItemTypes.TEAM:
      case SearchItemTypes.GROUP:
        /* eslint-disable no-case-declarations */
        const { canJoin, group } = this.canJoinTeam(currentItemValue as number);
        if (canJoin) {
          e.preventDefault();
          this.handleJoinTeam(group);
        } else {
          this.goToConversation(currentItemValue as number);
        }
        break;
      default:
        break;
    }
    this.addRecentRecord(currentItemValue);
  };

  // if search item removed need update selectIndex
  @action
  selectIndexChange = (sectionIndex: number, cellIndex: number) => {
    const [section, cell] = this.selectIndex;
    let data = this.searchResult;
    data = data.slice(0);

    const items: SearchItems = data[sectionIndex];
    items.ids.splice(cellIndex, 1);

    this.searchResult = data as SearchItems[];
    // remove current select item
    if (sectionIndex === section && cell === cellIndex) {
      this.setSelectIndex(InvalidIndexPath[0], InvalidIndexPath[1]);
      return;
    }

    // remove before current select item
    if (sectionIndex === section && cellIndex < cell) {
      this.setSelectIndex(section, cell - 1);
    }
  };

  @action
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

  @action
  onShowMore = (type: SearchItemTypes) => () => {
    const typeMap = {
      [SearchItemTypes.GROUP]: TAB_TYPE.GROUPS,
      [SearchItemTypes.PEOPLE]: TAB_TYPE.PEOPLE,
      [SearchItemTypes.TEAM]: TAB_TYPE.TEAM,
    };
    this._globalSearchStore.setCurrentTab(typeMap[type]);
    this._globalSearchStore.setCurrentView(SEARCH_VIEW.FULL_SEARCH);
  };
}

export { InstantSearchViewModel };
