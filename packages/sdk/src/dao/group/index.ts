/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-24 22:28:07
 */

import { BaseDao } from '../base';
import { Group } from '../../module/group/entity';
import { IDatabase, mainLogger } from 'foundation';

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

  async queryGroupsByIds(ids: number[]): Promise<Group[]> {
    return this.createQuery()
      .anyOf('id', ids)
      .filter((item: Group) => !item.is_archived)
      .toArray({
        sortBy: 'most_recent_post_created_at',
        desc: true,
      });
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
          // !item.deactivated &&
          // !item.is_archived &&
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

  async getLatestGroup(): Promise<Group | null> {
    return this.createQuery()
      .orderBy('most_recent_post_created_at', true)
      .filter((item: Group) => !item.is_archived && !item.is_team)
      .first();
  }

  async getLastNGroups(n: number): Promise<Group[]> {
    return this.createQuery()
      .orderBy('most_recent_post_created_at', true)
      .filter((item: Group) => !item.is_archived)
      .limit(n)
      .toArray();
  }
}

export default GroupDao;
