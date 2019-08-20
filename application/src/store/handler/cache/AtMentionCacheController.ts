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
// import { ServiceLoader, ServiceConfig } from 'sdk/src/module/serviceLoader';
// import { StateService } from 'sdk/src/module/state';

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
    console.error('before atmention:', atMentionPostIds);
    if (Array.isArray(atMentionPostIds)) {
      const length = atMentionPostIds.length;
      const r = atMentionPostIds.slice(length - DEFAULT_PAGE_SIZE, length);
      console.error('atmention:', r);
      return r;
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
