/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:45
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed } from 'mobx';
import { SearchService } from 'sdk/module/search';
import { container } from 'framework';
import { RecentSearchTypes } from 'sdk/module/search/entity';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';
import i18nT from '@/utils/i18nT';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';

import { GlobalSearchStore } from '../../../store';
import {
  ContentProps,
  ISearchItemModel,
  SEARCH_VIEW,
  SEARCH_SCOPE,
  TAB_TYPE,
} from './types';
import { SearchViewModel } from '../../common/Search.ViewModel';

class ContentItemViewModel extends SearchViewModel<ContentProps>
  implements ISearchItemModel {
  private _globalSearchStore: GlobalSearchStore = container.get(
    GlobalSearchStore,
  );

  @action
  onClick = () => {
    const { searchScope } = this.props;
    if (searchScope === SEARCH_SCOPE.CONVERSATION) {
      const conversationId = getGlobalValue(
        GLOBAL_KEYS.CURRENT_CONVERSATION_ID,
      );
      this._globalSearchStore.setSearchScope(SEARCH_SCOPE.CONVERSATION);
      this._globalSearchStore.setGroupId(conversationId);
    } else {
      this._globalSearchStore.setSearchScope(SEARCH_SCOPE.GLOBAL);
    }
    this._globalSearchStore.setCurrentView(SEARCH_VIEW.FULL_SEARCH);
    this._globalSearchStore.setCurrentTab(TAB_TYPE.CONTENT);

    this.addRecentRecord();
  }

  @computed
  get contentText() {
    const { searchScope, displayName } = this.props;

    if (searchScope === SEARCH_SCOPE.CONVERSATION) {
      const defaultTip = i18nT('globalSearch.inThisConversation');
      return `${displayName} ${defaultTip}`;
    }
    return displayName;
  }

  addRecentRecord = () => {
    const { displayName, searchScope } = this.props;
    const conversationId = getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);
    const searchService = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );

    searchService.addRecentSearchRecord(
      RecentSearchTypes.SEARCH,
      displayName,
      searchScope === SEARCH_SCOPE.CONVERSATION
        ? { groupId: conversationId }
        : {},
    );
  }
}

export { ContentItemViewModel };
