/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-28 13:34:04
 * Copyright © RingCentral. All rights reserved.
 */
import { daoManager, QUERY_DIRECTION } from '../../../dao';
import { GroupConfigDao } from '../../groupConfig/dao';

class GroupConfigController {
  constructor() {}

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

  updateHasMore(groupId: number, direction: QUERY_DIRECTION, hasMore: boolean) {
    const groupConfigDao = daoManager.getDao(GroupConfigDao);
    groupConfigDao.update({
      id: groupId,
      [`has_more_${direction}`]: hasMore,
    });
  }

  async deleteGroupsConfig(ids: number[]) {
    const groupConfigDao = daoManager.getDao(GroupConfigDao);
    await groupConfigDao.bulkDelete(ids);
  }
}

export { GroupConfigController };
