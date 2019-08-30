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
import { isDialogOpen } from '@/containers/Dialog/utils';

const DIALOG_KEY = 'GroupSearch';
export function switchToConversation({ id }: { id: number }) {
  portalManager.dismissAll();
  setTimeout(() => {
    analyticsCollector.goToConversation('switchConversationDialog');
    goToConversation({ conversationId: id });
  });
}

export function switchConversationHandler() {
  analyticsCollector.shortcuts('quickSwitcher');
  if (portalManager.isOpened(DIALOG_KEY)) return;
  if (isDialogOpen()) return;
  const { dismiss } = Dialog.simple(
    <GroupSearch onSelectChange={switchToConversation} />,
    {
      size: 'small',
      onClose: () => dismiss(),
      disableBackdropClick: true,
    },
    DIALOG_KEY,
  );
  return false; // prevent browser default behavior
}
