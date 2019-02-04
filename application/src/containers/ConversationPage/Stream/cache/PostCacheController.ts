import { FetchSortableDataListHandler } from '@/store/base';
import { Post } from 'sdk/src/module/post/entity';

/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2019-02-04 10:02:00
 * Copyright © RingCentral. All rights reserved.
 */

class PostCacheController {
  private _cacheMap: Map<
    number,
    FetchSortableDataListHandler<Post>
  > = new Map();

  get(groupId: number): FetchSortableDataListHandler<Post> | undefined {
    return this._cacheMap[groupId];
  }

  set(groupId: number, listHandler: FetchSortableDataListHandler<Post>) {
    this._cacheMap[groupId] = listHandler;
  }
}

const postController = new PostCacheController();

export { PostCacheController };
export default postController;
