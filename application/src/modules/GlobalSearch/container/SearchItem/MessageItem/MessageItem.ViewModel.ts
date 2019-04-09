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
import { getGlobalValue, getEntity } from '@/store/utils';
import { Group } from 'sdk/module/group/entity';
import GroupModel from '@/store/models/Group';
import { ENTITY_NAME } from '@/store';

import { GlobalSearchStore } from '../../../store';
import {
  ContentProps,
  ISearchItemModel,
  SEARCH_VIEW,
  SEARCH_SCOPE,
  TAB_TYPE,
} from './types';
import { SearchViewModel } from '../../common/Search.ViewModel';

class MessageItemViewModel extends SearchViewModel<ContentProps>
  implements ISearchItemModel {
  private _globalSearchStore: GlobalSearchStore = container.get(
    GlobalSearchStore,
  );

  @computed
  get group() {
    const { params } = this.props;
    const id = params && params.groupId;
    if (!id) {
      return null;
    }
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, id);
  }

  @computed
  get groupName() {
    const group = this.group;
    const { displayName } = this.props;
    if (!group) {
      return displayName;
    }
    const conversationId = getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);
    if (group.id === conversationId) {
      return `${displayName} in this conversation`;
    }
    return `${displayName} in ${group.displayName}`;
  }

  @action
  onClick = () => {
    const { searchScope } = this.props;

    this._globalSearchStore.setCurrentView(SEARCH_VIEW.FULL_SEARCH);
    this._globalSearchStore.setCurrentTab(TAB_TYPE.CONTENT);
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

export { MessageItemViewModel };
