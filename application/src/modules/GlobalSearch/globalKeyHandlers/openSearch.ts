/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-20 11:10:56
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { GlobalSearchService } from '@/modules/GlobalSearch/service';
import { analyticsCollector } from '@/AnalyticsCollector';
import { isDialogOpen } from '@/containers/Dialog/utils';

function openSearch() {
  if (isDialogOpen()) return;
  const globalSearchService = container.get<GlobalSearchService>(
    GlobalSearchService,
  );
  globalSearchService.openGlobalSearch();
  analyticsCollector.shortcuts('globalSearch');
  return false; // prevent browser default behavior
}

export { openSearch };
