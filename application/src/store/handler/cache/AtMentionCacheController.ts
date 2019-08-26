/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-08-17 15:21:54
 * Copyright © RingCentral. All rights reserved.
 */

import { ENTITY_NAME } from '@/store/constants';
import storeManager from '@/store';
import SingleEntityMapStore from '@/store/base/SingleEntityMapStore';
import { DiscontinuousPostCacheController } from './DiscontinuousPostCacheController';
import { DEFAULT_PAGE_SIZE, AT_MENTION_ID } from '../constant';

class AtMentionCacheController extends DiscontinuousPostCacheController {
  constructor() {
    super();
  }

  name() {
    return 'AtMentionCacheController';
  }

  protected getSourceIds() {
    const store = storeManager.getEntityMapStore(
      ENTITY_NAME.MY_STATE,
    ) as SingleEntityMapStore<any, any>;
    const atMentionPostIds = store.get('atMentionPostIds');
    if (Array.isArray(atMentionPostIds)) {
      const length = atMentionPostIds.length;
      return atMentionPostIds.slice(length - DEFAULT_PAGE_SIZE, length);
    }
    return [];
  }

  isInRange(groupId: number): boolean {
    return groupId === AT_MENTION_ID;
  }
}

const atMentionCacheController = new AtMentionCacheController();

export default atMentionCacheController;
export { AtMentionCacheController };
