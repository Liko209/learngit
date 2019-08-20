/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-08-16 14:42:10
 * Copyright © RingCentral. All rights reserved.
 */

import { ENTITY_NAME } from '@/store/constants';
import storeManager from '@/store';
import SingleEntityMapStore from '@/store/base/SingleEntityMapStore';
import { DiscontinuousPostCacheController } from './DiscontinuousPostCacheController';
import { BOOKMARK_ID, DEFAULT_PAGE_SIZE } from '../constant';

class BookmarkCacheController extends DiscontinuousPostCacheController {
  constructor() {
    super();
  }

  name() {
    return 'BookmarkController';
  }

  protected getSourceIds() {
    const store = storeManager.getEntityMapStore(
      ENTITY_NAME.PROFILE,
    ) as SingleEntityMapStore<any, any>;
    const favoritePostIds = store.get('favoritePostIds');
    if (Array.isArray(favoritePostIds)) {
      return favoritePostIds.slice(0, DEFAULT_PAGE_SIZE);
    }
    return [];
  }

  isInRange(groupId: number): boolean {
    return groupId === BOOKMARK_ID;
  }
}

const bookmarkCacheController = new BookmarkCacheController();

export default bookmarkCacheController;
export { BookmarkCacheController };
