/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-29 20:45:34
 * Copyright © RingCentral. All rights reserved.
 */

import { PostUsedItemCache } from '../PostUsedItemCache';
import storeManager from '@/store';
import PostModel from '@/store/models/Post';
import { Post } from 'sdk/module/post/entity';

describe('PostUsedItemCache.getUsedId()', () => {
  let postUsedItemCache: PostUsedItemCache;
  beforeEach(() => {
    postUsedItemCache = new PostUsedItemCache();
  });
  it('should return item ids when getUsedId', () => {
    const storeData: { [id: number]: PostModel } = {};
    const post = { id: 1, item_ids: [2, 3, 4] };
    storeData[1] = new PostModel(post as Post);
    const postStore = {
      getData: jest.fn(() => storeData),
    };
    storeManager.getEntityMapStore = jest.fn().mockReturnValueOnce(postStore);
    const ids = postUsedItemCache.getUsedId();
    expect(ids).toEqual([2, 3, 4]);
  });

  it('should return item ids when items referenced by many posts', () => {
    const storeData: { [id: number]: PostModel } = {};
    const post1 = { id: 1, item_ids: [2, 3, 4] };
    const post2 = { id: 2, item_ids: [2, 5, 6] };
    storeData[1] = new PostModel(post1 as Post);
    storeData[2] = new PostModel(post2 as Post);
    const postStore = {
      getData: jest.fn(() => storeData),
    };
    storeManager.getEntityMapStore = jest.fn().mockReturnValueOnce(postStore);
    const ids = postUsedItemCache.getUsedId();
    expect(ids).toEqual([2, 3, 4, 5, 6]);
  });
});
