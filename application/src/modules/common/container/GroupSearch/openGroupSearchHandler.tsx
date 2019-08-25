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

const DIALOG_KEY = 'GroupSearch';
function gotoConversation({ id }: { id: number }) {
  portalManager.dismissLast();
  setTimeout(() => {
    analyticsCollector.goToConversation('switchConversationDialog');
    goToConversation({ conversationId: id });
  });
}

export function openGroupSearchHandler() {
  analyticsCollector.shortcuts('quickSwitcher');
  if (portalManager.isOpened(DIALOG_KEY)) return;
  Dialog.simple(
    <GroupSearch onSelectChange={gotoConversation} />,
    {
      size: 'small',
      enableEscapeClose: true,
    },
    DIALOG_KEY,
  );
  return false; // prevent browser default behavior
}
