/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-20 11:10:56
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { GlobalSearchService } from '@/modules/GlobalSearch/service';

function openSearch() {
  const globalSearchService = container.get<GlobalSearchService>(
    GlobalSearchService,
  );
  globalSearchService.openGlobalSearch();
  return false; // prevent browser default behavior
}

export { openSearch };
