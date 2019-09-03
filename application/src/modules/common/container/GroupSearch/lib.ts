/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-26 23:55:59
 * Copyright © RingCentral. All rights reserved.
 */

import GroupModel from '@/store/models/Group';
import { CONVERSATION_TYPES } from '@/constants';
import { GroupSearchItem } from '@/containers/Downshift/GroupSearch/GroupSearchItem';
import { ContactSearchItem } from '@/containers/Downshift/ContactSearch/ContactSearchItem';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import _ from 'lodash';
import { SortableModel } from 'sdk/framework/model';
import { Group } from 'sdk/module/group';
import { SortUtils } from 'sdk/framework/utils';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SearchService } from 'sdk/module/search';

function mapGroupModelToItem(groupModel: GroupModel) {
  const members = groupModel.members;

  switch (groupModel.type) {
    case CONVERSATION_TYPES.TEAM:
    case CONVERSATION_TYPES.NORMAL_GROUP:
      return {
        Item: GroupSearchItem,
        props: { itemId: groupModel.id, size: 'large' },
      };
    case CONVERSATION_TYPES.ME:
      return {
        Item: ContactSearchItem,
        props: { itemId: members[0], showEmail: false, size: 'large' },
      };
    default: {
      const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
      const otherId = _.difference(members, [currentUserId])[0];
      return {
        Item: ContactSearchItem,
        props: { itemId: otherId, showEmail: false, size: 'large' },
      };
    }
  }
}

function recentFirstSorter(a: SortableModel<Group>, b: SortableModel<Group>) {
  const result = SortUtils.compareArrayOfSameLens(b.sortWeights, a.sortWeights);
  if (result !== 0) {
    return result;
  }

  const mostRecentA = a.entity.most_recent_post_created_at || 0;
  const mostRecentB = b.entity.most_recent_post_created_at || 0;
  if (mostRecentA > mostRecentB) {
    return -1;
  }

  if (mostRecentA < mostRecentB) {
    return 1;
  }

  return SortUtils.compareLowerCaseString(a.lowerCaseName, b.lowerCaseName);
}

async function searchFunc(searchKey: string, meFirst: boolean) {
  const searchService = ServiceLoader.getInstance<SearchService>(
    ServiceConfig.SEARCH_SERVICE,
  );
  const result = await searchService.doFuzzySearchPersonsAndGroups(
    searchKey,
    {
      meFirst,
      excludeSelf: false,
      fetchAllIfSearchKeyEmpty: false,
      recentFirst: !!searchKey,
    },
    {
      meFirst,
      myGroupsOnly: true,
      fetchAllIfSearchKeyEmpty: true,
      recentFirst: !!searchKey,
    },
    searchKey ? undefined : recentFirstSorter,
  );
  return result.sortableModels;
}

export { searchFunc, mapGroupModelToItem, recentFirstSorter };
