/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-22 15:38:54
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { GroupSearch } from './GroupSearch';
import { Dialog } from '@/containers/Dialog';
import { goToConversationWithLoading } from '@/common/goToConversation';
import portalManager from '@/common/PortalManager';
import { analyticsCollector } from '@/AnalyticsCollector';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SearchService } from 'sdk/module/search';
import { recentFirstSorter, searchFunc } from './lib';

const DIALOG_KEY = 'GroupSearch';
async function switchToConversation({ id }: { id: number }) {
  portalManager.dismissAll();

  setTimeout(() => {
    analyticsCollector.goToConversation('switchConversationDialog');
    goToConversationWithLoading({ id });
  });
}

function switchConversationHandler() {
  const getDefaultList = async () => {
    const searchService = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );
    const result = await searchService.doFuzzySearchAllGroups(undefined, {
      myGroupsOnly: true,
      fetchAllIfSearchKeyEmpty: true,
      recentFirst: false,
      sortFunc: recentFirstSorter,
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
      searchFunc={key => searchFunc(key, false)}
      defaultList={getDefaultList}
    />,
    {
      size: 'small',
      onClose: () => dismiss(),
      disableBackdropClick: true,
    },
    DIALOG_KEY,
  );
}

export { switchConversationHandler, switchToConversation };
