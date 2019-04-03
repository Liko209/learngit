/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:49:32
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action } from 'mobx';
import { container } from 'framework';
import storeManager from '@/store/base/StoreManager';
import { SearchService } from 'sdk/module/search';
import { GroupService } from 'sdk/module/group';
import { ENTITY_NAME } from '@/store/constants';
import { RecentSearchTypes } from 'sdk/module/search/entity';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { OpenProfile } from '@/common/OpenProfile';

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
} from './types';
import { SearchViewModel } from '../common/Search.ViewModel';

const ONLY_ONE_SECTION_LENGTH = 9;
const MORE_SECTION_LENGTH = 3;

const InvalidIndexPath: number[] = [-1, -1];

class InstantSearchViewModel extends SearchViewModel<InstantSearchProps>
  implements InstantSearchViewProps {
  @observable terms: string[] = [];
  @observable searchResult: SearchItems[] = [];
  @observable selectIndex: number[] = InvalidIndexPath;
  private _globalSearchStore: GlobalSearchStore = container.get(
    GlobalSearchStore,
  );

  constructor() {
    super();

    this.reaction(
      () => ({
        searchKey: this._globalSearchStore.searchKey,
        open: this._globalSearchStore.open,
      }),
      ({ searchKey, open }: { searchKey: string; open: boolean }) => {
        this.setSearchResult(searchKey);
        if (!open) {
          this.resetData();
        }
      },
      {
        fireImmediately: true,
      },
    );
  }

  joinTeam(id: number) {
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
  }

  @action
  onClose = () => {
    container.get(GlobalSearchService).closeGlobalSearch();
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

    const groupService: GroupService = GroupService.getInstance();

    const [persons, groups, teams] = await Promise.all([
      SearchService.getInstance().doFuzzySearchPersons({
        searchKey: key,
        excludeSelf: false,
        recentFirst: true,
      }),
      groupService.doFuzzySearchGroups(key),
      groupService.doFuzzySearchTeams(key),
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

  @action
  resetData = () => {
    this.searchResult = [];
    this.terms = [];
    this.resetSelectIndex();
  }

  @action
  resetSelectIndex = () => {
    this.selectIndex = InvalidIndexPath;
  }

  @action
  setSelectIndex = (section: number, cellIndex: number) => {
    this.selectIndex = [section, cellIndex];
  }

  findNextValidSectionLength = (section: number, offset: number): number[] => {
    const data = this.searchResult;
    for (let i = section; i >= 0 && i < data.length; i += offset) {
      const { length } = (data[i] as SearchItems).ids;
      if (length > 0) {
        return [i, length];
      }
    }
    return InvalidIndexPath;
  }

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

  addRecentRecord = (id: number) => {
    SearchService.getInstance().addRecentSearchRecord(this.currentItemType, id);
  }

  @action
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
    } else {
      if (currentSection < data.length - 1) {
        const [nextSection] = this.findNextValidSectionLength(section + 1, 1);
        if (nextSection !== -1) {
          this.setSelectIndex(nextSection, 0);
        }
      }
    }
  }

  @action
  onEnter = (e: KeyboardEvent) => {
    const currentItemId = this.currentItemId;
    const currentItemType = this.currentItemType;

    if (!currentItemId) {
      return;
    }
    this.addRecentRecord(currentItemId);
    if (currentItemType !== 'people') {
      const { canJoin, group } = this.joinTeam(currentItemId);
      if (canJoin) {
        e.preventDefault();
        this.handleJoinTeam(group);
      } else {
        this.goToConversation(currentItemId);
      }
    } else {
      OpenProfile.show(currentItemId, null, this.onClose);
    }
  }

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
  }

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
}

export { InstantSearchViewModel };
