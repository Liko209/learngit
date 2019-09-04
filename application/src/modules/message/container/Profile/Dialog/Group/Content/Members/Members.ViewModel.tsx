/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action, comparer, computed } from 'mobx';
import { ProfileDialogGroupViewModel } from '../../Group.ViewModel';
import { MembersProps, MembersViewProps } from './types';
import SortableGroupMemberHandler from '@/store/handler/SortableGroupMemberHandler';
import { SearchService } from 'sdk/module/search';
import { Person } from 'sdk/module/person/entity';
import { SortableModel } from 'sdk/framework/model';
import { debounce } from 'lodash';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

const DELAY_DEBOUNCE = 300;

class MembersViewModel extends ProfileDialogGroupViewModel
  implements MembersViewProps {
  @observable
  private _sortableGroupMemberHandler: SortableGroupMemberHandler;
  @observable
  _filteredMemberIds: number[] = [];
  @observable
  keywords: string = '';
  changeSearchInputDebounce: () => void;

  constructor(props: MembersProps) {
    super(props);
    this.changeSearchInputDebounce = debounce(
      this.changeSearchInput.bind(this),
      DELAY_DEBOUNCE,
    );
    this.reaction(() => this.id, this.createSortableHandler, {
      fireImmediately: true,
    });
    this.reaction(
      () => ({
        keywords: this.keywords,
        allSortedIds: this._sortableGroupMemberHandler.allSortedMemberIds,
      }),
      () => {
        this.handleSearch();
      },
      { fireImmediately: true, equals: comparer.structural },
    );
  }

  @computed
  get filteredMemberIds() {
    return this.keywords
      ? this._filteredMemberIds
      : this._sortableGroupMemberHandler.sortedMemberIds;
  }

  createSortableHandler = () => {
    // This handler need observable
    this._sortableGroupMemberHandler = new SortableGroupMemberHandler(this.id);
  };

  @action
  changeSearchInput = (keywords: string) => {
    this.keywords = keywords;
  };

  @action
  handleSearch = async () => {
    if (this.keywords) {
      const searchService = ServiceLoader.getInstance<SearchService>(
        ServiceConfig.SEARCH_SERVICE,
      );
      const result = await searchService.doFuzzySearchPersons(this.keywords, {
        excludeSelf: false,
        arrangeIds: this._sortableGroupMemberHandler.allSortedMemberIds,
        fetchAllIfSearchKeyEmpty: true,
        recentFirst: true,
      });
      const ids = result.sortableModels.map(
        (person: SortableModel<Person>) => person.id,
      );
      this._filteredMemberIds = ids;
      return result;
    }

    return null;
  };

  @action
  hasMore = () => {
    if (this.keywords) {
      return false;
    }

    return this.group.members.length !== this.filteredMemberIds.length;
  };

  @action
  loadInitialData = async () => {
    await this._sortableGroupMemberHandler.fetchGroupMembersByPage(20);

    await this.handleSearch();
  };

  @action
  loadMore = async (direction: 'up' | 'down', count: number) => {
    await this._sortableGroupMemberHandler.fetchGroupMembersByPage(count);
  };

  dispose = () => {
    this._sortableGroupMemberHandler &&
      this._sortableGroupMemberHandler.dispose();
  };
}
export { MembersViewModel };
