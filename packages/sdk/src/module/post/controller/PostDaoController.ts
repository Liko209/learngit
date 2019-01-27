/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-27 14:15:59
 * Copyright © RingCentral. All rights reserved.
 */

import {
  daoManager,
  PostDao,
  QUERY_DIRECTION,
  GroupConfigDao,
} from '../../../dao';
import { Post } from '../entity/Post';
class PostDaoController {
  constructor() {}

  async getPostCountByGroupId(groupId: number): Promise<number> {
    const dao = daoManager.getDao(PostDao);
    return dao.groupPostCount(groupId);
  }

  async getPostFromLocal(postId: number): Promise<Post | null> {
    const dao = daoManager.getDao(PostDao);
    return dao.get(postId);
  }

  /**
   * If direction === QUERY_DIRECTION.OLDER, should check has more.
   * If direction === QUERY_DIRECTION.NEWER, return true
   */
  async hasMorePostInRemote(groupId: number, direction: QUERY_DIRECTION) {
    const groupConfigDao = daoManager.getDao(GroupConfigDao);
    return direction === QUERY_DIRECTION.OLDER
      ? await groupConfigDao.hasMoreRemotePost(groupId, direction)
      : true;
  }
}

export { PostDaoController };
