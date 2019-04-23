/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:45
 * Copyright © RingCentral. All rights reserved.
 */
import { action } from 'mobx';
import { SearchService } from 'sdk/module/search';
import { RecentSearchTypes } from 'sdk/module/search/entity';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';
import i18nT from '@/utils/i18nT';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { promisedComputed } from 'computed-async-mobx';
import { ContentProps, ISearchItemModel, SEARCH_SCOPE } from './types';
import { SearchViewModel } from '../../common/Search.ViewModel';
import { toSearchContent } from '../../common/toSearchContent';

class ContentItemViewModel extends SearchViewModel<ContentProps>
  implements ISearchItemModel {
  @action
  onClick = () => {
    const { searchScope } = this.props;
    toSearchContent(searchScope === SEARCH_SCOPE.CONVERSATION);
    this.addRecentRecord();
  }

  contentText = promisedComputed(this.props.displayName, async () => {
    const { searchScope, displayName } = this.props;

    if (searchScope === SEARCH_SCOPE.CONVERSATION) {
      const defaultTip = await i18nT('globalSearch.inThisConversation');
      return `${displayName} ${defaultTip}`;
    }
    return displayName;
  });

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
