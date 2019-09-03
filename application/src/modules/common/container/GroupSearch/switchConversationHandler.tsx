/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-22 15:38:54
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { GroupSearch } from './GroupSearch';
import { Dialog } from '@/containers/Dialog';
import { goToConversation } from '@/common/goToConversation';
import portalManager from '@/common/PortalManager';
import { analyticsCollector } from '@/AnalyticsCollector';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SearchService } from 'sdk/module/search';

const DIALOG_KEY = 'GroupSearch';
export function switchToConversation({ id }: { id: number }) {
  portalManager.dismissAll();
  setTimeout(() => {
    analyticsCollector.goToConversation('switchConversationDialog');
    goToConversation({ conversationId: id });
  });
}

export function switchConversationHandler() {
  const searchFunc = async (searchKey: string) => {
    const searchService = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );
    const result = await searchService.doFuzzySearchAllGroups(searchKey, {
      myGroupsOnly: true,
      fetchAllIfSearchKeyEmpty: true,
      sortFunc: (lhs, rhs) => {
        const lhsModifiedAt = lhs.entity.most_recent_content_modified_at;
        const rhsModifiedAt = rhs.entity.most_recent_content_modified_at;

        if (lhsModifiedAt < rhsModifiedAt) return 1;
        if (lhsModifiedAt > rhsModifiedAt) return -1;
        return 0;
      },
    });
    return result.sortableModels;
  };

  analyticsCollector.shortcuts('quickSwitcher');
  if (portalManager.isOpened(DIALOG_KEY)) return;
  const { dismiss } = Dialog.simple(
    <GroupSearch
      onSelect={switchToConversation}
      dialogTitle={'groupSearch.dialogTitle'}
      listTitle={'groupSearch.listTitle'}
      searchFunc={searchFunc}
    />,
    {
      size: 'small',
      onClose: () => dismiss(),
      disableBackdropClick: true,
    },
    DIALOG_KEY,
  );
}
