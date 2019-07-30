/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-30 14:09:00
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupDao } from '../GroupDao';
import { setup } from '../../../../dao/__tests__/utils';
import { Group } from '../../entity';
import { groupFactory } from '../../../../__tests__/factories';

describe('GroupDao', () => {
  let groupDao: GroupDao;

  beforeAll(() => {
    const { database } = setup();
    groupDao = new GroupDao(database);
  });

  it('Save groups', async () => {
    const group: Group = groupFactory.build({ id: 100 });
    await groupDao.put(group);
    const matchedGroup = await groupDao.get(100);
    expect(matchedGroup).toMatchObject(group);
  });

  describe('Queries', () => {
    let groups: Group[];
    beforeAll(async () => {
      groups = [
        groupFactory.build({
          id: 1,
          members: [123, 234],
          is_team: true,
          set_abbreviation: 'Ringcentral',
          deactivated: false,
          most_recent_post_created_at: 1,
        }),
        groupFactory.build({
          id: 2,
          members: [124, 234],
          is_team: true,
          set_abbreviation: 'XMN Teaching',
          deactivated: false,
          most_recent_post_created_at: 2,
        }),
        groupFactory.build({
          id: 3,
          members: [123, 234],
          is_team: true,
          set_abbreviation: 'Ringcentral2',
          most_recent_post_created_at: 3,
        }),
        groupFactory.build({
          id: 4,
          members: [123, 234],
          is_team: false,
          set_abbreviation: '123, 234',
          deactivated: false,
          most_recent_post_created_at: 4,
        }),
        groupFactory.build({
          id: 5,
          members: [123, 234, 345],
          is_team: false,
          set_abbreviation: '123, 234, 345',
          most_recent_post_created_at: 5,
        }),
      ];
      await groupDao.clear();
      await groupDao.bulkPut(groups);
    });

    it('query groups', async () => {
      const teams = await groupDao.queryGroups(0, Infinity, false);
      expect(teams.map((t: Group) => t.id)).toEqual([4, 5]);
    });

    it('query teams', async () => {
      const teams = await groupDao.queryGroups(0, Infinity, true);
      expect(teams.map((t: Group) => t.id).sort()).toEqual([3, 2, 1].sort());
    });

    it('query teams and excludes items by id', async () => {
      const teams = await groupDao.queryGroups(0, Infinity, true, [1]);
      expect(teams.map((t: Group) => t.id)).toEqual([2, 3]);
    });

    it('query all groups', async () => {
      const teams = await groupDao.queryAllGroups();
      expect(teams.map((t: Group) => t.id)).toEqual([5, 4, 3, 2, 1]);
    });

    it('query all groups with offset and limit', async () => {
      const teams = await groupDao.queryAllGroups(1, 2);
      expect(teams.map((t: Group) => t.id)).toEqual([4, 3]);
    });

    it('search team', async () => {
      const teams = await groupDao.searchTeamByKey('central');
      expect(teams).toHaveLength(2);
    });

    it('query group by member id set', async () => {
      await expect(
        groupDao.queryGroupByMemberList([123, 234]),
      ).resolves.toMatchObject(groups[3]);
    });
  });
});
