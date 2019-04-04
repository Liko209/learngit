/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:45
 * Copyright © RingCentral. All rights reserved.
 */
import { action } from 'mobx';
import { SearchService } from 'sdk/module/search';
import { container } from 'framework';
import { RecentSearchTypes } from 'sdk/module/search/entity';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';

import { GlobalSearchStore } from '../../../store';
import {
  ContentProps,
  ISearchItemModel,
  SEARCH_VIEW,
  SEARCH_SCOPE,
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

    this._globalSearchStore.setCurrentView(SEARCH_VIEW.FULL_SEARCH);
    this._globalSearchStore.setSearchScope(searchScope);
    // TODO will add record in JIRA: FIJI-4696
    // this.addRecentRecord();
  }

  addRecentRecord = () => {
    const { displayName, searchScope } = this.props;
    const conversationId = getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);

    SearchService.getInstance().addRecentSearchRecord(
      RecentSearchTypes.SEARCH,
      displayName,
      searchScope === SEARCH_SCOPE.CONVERSATION
        ? { groupId: conversationId }
        : {},
    );
  }
}

export { ContentItemViewModel };
