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
import i18nT from '@/utils/i18nT';

import { GlobalSearchStore } from '../../../store';
import {
  ContentProps,
  ISearchItemModel,
  SEARCH_VIEW,
  TAB_TYPE,
  SEARCH_SCOPE,
} from './types';
import { SearchViewModel } from '../../common/Search.ViewModel';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';

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
      return `${displayName} ${i18nT('globalSearch.inThisConversation')}`;
    }
    return `${displayName} ${i18nT('globalSearch.in')} ${group.displayName}`;
  }

  @action
  onClick = () => {
    const { params, displayName } = this.props;

    if (params && params.groupId) {
      this._globalSearchStore.setSearchScope(SEARCH_SCOPE.CONVERSATION);
      this._globalSearchStore.setGroupId(params.groupId);
    } else {
      this._globalSearchStore.setSearchScope(SEARCH_SCOPE.GLOBAL);
    }
    this._globalSearchStore.setSearchKey(displayName);
    this._globalSearchStore.setCurrentView(SEARCH_VIEW.FULL_SEARCH);
    this._globalSearchStore.setCurrentTab(TAB_TYPE.CONTENT);

    this.addRecentRecord();
  }

  addRecentRecord = () => {
    const { displayName } = this.props;

    const searchService = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );
    const id = this.group && this.group.id;
    searchService.addRecentSearchRecord(
      RecentSearchTypes.SEARCH,
      displayName,
      id ? { groupId: id } : {},
    );
  }
}

export { MessageItemViewModel };
