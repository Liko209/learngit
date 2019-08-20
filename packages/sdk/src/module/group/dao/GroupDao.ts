/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-30 14:09:00
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseDao } from '../../../framework/dao';
import { Group } from '../entity';
import { IDatabase } from 'foundation/db';
import { mainLogger } from 'foundation/log';

class GroupDao extends BaseDao<Group> {
  static COLLECTION_NAME = 'group';
  // TODO, use IDatabase after import foundation module in
  constructor(db: IDatabase) {
    super(GroupDao.COLLECTION_NAME, db);
  }

  async queryGroups(
    offset: number,
    limit: number,
    isTeam: boolean,
    excludeIds: number[] = [],
    currentUserId?: number,
  ): Promise<Group[]> {
    mainLogger.debug(`queryGroup isTeam:${isTeam} excludeIds:${excludeIds}`);
    const query = this.createQuery()
      .filter(
        (item: Group) =>
          !item.is_archived &&
          item.is_team === isTeam &&
          (currentUserId ? item.members.includes(currentUserId) : true),
      )
      // .orderBy('most_recent_post_created_at', true)
      .offset(offset)
      .limit(limit);
    if (Array.isArray(excludeIds)) {
      query.filter((item: Group) => excludeIds.indexOf(item.id) === -1);
    }
    return query.toArray();
  }

  async queryAllGroups(
    offset: number = 0,
    limit: number = Infinity,
  ): Promise<Group[]> {
    mainLogger.debug('queryAllGroups');
    return this.createQuery()
      .orderBy('most_recent_post_created_at', true)
      .offset(offset)
      .limit(limit)
      .filter((item: Group) => !item.is_archived)
      .toArray();
  }

  async searchTeamByKey(key: string): Promise<Group[]> {
    mainLogger.debug(`searchTeamByKey ==> ${key}`);
    return this.createQuery()
      .equal('is_team', true)
      .filter(
        (item: Group) =>
          typeof item.set_abbreviation === 'string' &&
          new RegExp(`${key}`, 'i').test(item.set_abbreviation),
      )
      .toArray();
  }

  async queryGroupByMemberList(members: number[]): Promise<Group | null> {
    mainLogger.debug(`queryGroupByMemberList members ==> ${members}`);

    return this.createQuery()
      .equal('is_team', false)
      .filter(
        (item: Group) =>
          !item.is_archived &&
          item.members &&
          item.members.sort().toString() === members.sort().toString(),
      )
      .first();
  }
}

export { GroupDao };
