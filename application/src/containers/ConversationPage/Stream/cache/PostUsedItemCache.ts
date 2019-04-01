/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-29 21:11:44
 * Copyright © RingCentral. All rights reserved.
 */

import IUsedCache from '@/store/base/IUsedCache';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import PostModel from '@/store/models/Post';
import { ENTITY_NAME } from '@/store/constants';
import storeManager from '@/store';
import { Post } from 'sdk/module/post/entity';
import _ from 'lodash';

class PostUsedItemCache implements IUsedCache {
  getUsedId(): number[] {
    let usedItemIds: number[] = [];
    const data = (storeManager.getEntityMapStore(
      ENTITY_NAME.POST,
    ) as MultiEntityMapStore<Post, PostModel>).getData();

    const idsArray = Object.values(data).map(
      (pstModel: PostModel) => pstModel.itemIds,
    );

    usedItemIds = [...new Set(_.flatten(idsArray))];

    return usedItemIds;
  }
}

export { PostUsedItemCache };
