/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-01 18:26:44
 * Copyright © RingCentral. All rights reserved.
 */

import GroupModel from '@/store/models/Group';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { PinnedPostListHandler } from '../PinnedPostListHandler';
import { DiscontinuousPostCacheController } from './DiscontinuousPostCacheController';

class PinnedPostCacheController extends DiscontinuousPostCacheController {
  private _pinPostHandlerCache: Map<number, PinnedPostListHandler>;

  constructor() {
    super();
    this._pinPostHandlerCache = new Map();
  }

  name() {
    return 'PinnedPostCacheController';
  }

  protected initDiscontinuousHandler(groupId: number) {
    const pinnedPostListHandler = new PinnedPostListHandler(
      groupId,
      this._getSourceIds(groupId),
    );

    const listHandler = pinnedPostListHandler.fetchSortableDataHandler();
    this._pinPostHandlerCache.set(groupId, pinnedPostListHandler);
    this.set(groupId, listHandler);
    listHandler.maintainMode = true;
  }

  private _getSourceIds(id: number): number[] {
    const groupModel = getEntity(ENTITY_NAME.GROUP, id) as GroupModel;
    return groupModel.pinnedPostIds;
  }

  protected removeInternal(groupId: number) {
    const pinnedPostHandler = this._pinPostHandlerCache.get(groupId);
    if (pinnedPostHandler) {
      pinnedPostHandler.dispose();
      this._pinPostHandlerCache.delete(groupId);
    }

    super.removeInternal(groupId);
  }
}

const pinnedPostCacheController = new PinnedPostCacheController();

export default pinnedPostCacheController;
export { PinnedPostCacheController };
