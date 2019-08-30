/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-03 10:14:06
 * Copyright © RingCentral. All rights reserved.
 */

import { action, computed } from 'mobx';
import { GroupService } from 'sdk/module/group';
import { SearchService } from 'sdk/module/search';
import { container } from 'framework/ioc';
import { StoreViewModel } from '@/store/ViewModel';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';

import { GlobalSearchStore } from '../../store';
import {
  ListSearchResultViewProps,
  ListSearchResultProps,
  TAB_TYPE,
  SortableModel,
  SectionType,
  Person,
  Group,
} from './types';

class ListSearchResultViewModel extends StoreViewModel<ListSearchResultProps>
  implements ListSearchResultViewProps {
  private _globalSearchStore: GlobalSearchStore = container.get(
    GlobalSearchStore,
  );

  @computed
  get currentTab() {
    return this._globalSearchStore.currentTab;
  }

  getSection<T>(section: SectionType<T>) {
    const models = section.sortableModels;
    const ids = (models || []).map((model: SortableModel<T>) => model.id);
    return {
      ids,
      models: models || [],
    };
  }

  fetch = async (tab: TAB_TYPE) => {
    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    const searchKey = this._globalSearchStore.searchKey;

    if (tab === TAB_TYPE.PEOPLE) {
      const searchService = ServiceLoader.getInstance<SearchService>(
        ServiceConfig.SEARCH_SERVICE,
      );

      const result = await searchService.doFuzzySearchPersons(searchKey, {
        excludeSelf: false,
        recentFirst: true,
      });
      return this.getSection<Person>(result);
    }

    if (tab === TAB_TYPE.GROUPS) {
      const result = await groupService.doFuzzySearchGroups(
        searchKey,
        undefined,
        true,
      );
      return this.getSection<Group>(result);
    }

    if (tab === TAB_TYPE.TEAM) {
      const result = await groupService.doFuzzySearchTeams(
        searchKey,
        undefined,
        true,
      );
      return this.getSection<Group>(result);
    }

    return null;
  };

  @action
  search = async (tab: TAB_TYPE) => {
    const result = await this.fetch(tab);
    if (!result) {
      return [];
    }
    return result.ids;
  };
}

export { ListSearchResultViewModel };
