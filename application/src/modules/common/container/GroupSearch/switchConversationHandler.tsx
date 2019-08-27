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
  portalManager.dismissLast();
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
    });
    return result
  }
  analyticsCollector.shortcuts('quickSwitcher');
  if (portalManager.isOpened(DIALOG_KEY)) return;
  Dialog.simple(
    <GroupSearch onSelectChange={switchToConversation} dialogTitle={'groupSearch.dialogTitle'} listTitle={'groupSearch.listTitle'} searchFunc={searchFunc} />,
    {
      size: 'small',
      enableEscapeClose: true,
    },
    DIALOG_KEY,
  );
  return false; // prevent browser default behavior
}
