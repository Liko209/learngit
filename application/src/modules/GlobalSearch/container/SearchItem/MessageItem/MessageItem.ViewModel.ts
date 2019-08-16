/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:45
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed } from 'mobx';
import { promisedComputed } from 'computed-async-mobx';
import { SearchService } from 'sdk/module/search';
import { container } from 'framework/ioc';
import { RecentSearchTypes } from 'sdk/module/search/entity';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue, getEntity } from '@/store/utils';
import { Group } from 'sdk/module/group/entity';
import GroupModel from '@/store/models/Group';
import { ENTITY_NAME } from '@/store';
import i18nT from '@/utils/i18nT';

import { GlobalSearchStore } from '../../../store';
import { ContentProps, ISearchItemModel } from './types';
import { SearchViewModel } from '../../common/Search.ViewModel';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { toSearchContent } from '../../common/toSearchContent';

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

  groupName = promisedComputed('', async () => {
    const group = this.group;
    const { displayName } = this.props;
    if (!group) {
      return displayName;
    }
    const conversationId = getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID);
    if (group.id === conversationId) {
      return `${displayName} ${await i18nT('globalSearch.inThisConversation')}`;
    }
    return `${displayName} ${await i18nT('common.preposition.in')} ${
      group.displayName
    }`;
  });

  @action
  onClick = () => {
    const { params, displayName } = this.props;

    toSearchContent(!!(params && params.groupId), params && params.groupId);
    this._globalSearchStore.setSearchKey(displayName);

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
