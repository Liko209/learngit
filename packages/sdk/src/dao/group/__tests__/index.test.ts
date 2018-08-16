/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-24 22:40:56
 */
import GroupDao from '..';
import { setup } from '../../__tests__/utils';
import { Group } from '../../../models';
import { groupFactory } from '../../../__tests__/factories';

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
    beforeAll(async () => {
      const groups = [
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
          members: [123, 234],
          is_team: false,
          set_abbreviation: 'Nello Huang',
          deactivated: false,
          most_recent_post_created_at: 2,
        }),
        groupFactory.build({
          id: 3,
          members: [124, 234],
          is_team: true,
          set_abbreviation: 'XMN Teaching',
          deactivated: false,
          most_recent_post_created_at: 3,
        }),
        groupFactory.build({
          id: 4,
          members: [123, 234],
          is_team: true,
          set_abbreviation: 'Ringcentral2',
          most_recent_post_created_at: 4,
        }),
      ];
      await groupDao.clear();
      await groupDao.bulkPut(groups);
    });

    it('query groups', async () => {
      const teams = await groupDao.queryGroups(0, Infinity, false);
      expect(teams.map((t: Group) => t.id)).toEqual([2]);
    });

    it('query teams', async () => {
      const teams = await groupDao.queryGroups(0, Infinity, true);
      expect(teams.map((t: Group) => t.id)).toEqual([4, 3, 1]);
    });

    it('query teams and excludes items by id', async () => {
      const teams = await groupDao.queryGroups(0, Infinity, true, [1, 4]);
      expect(teams.map((t: Group) => t.id)).toEqual([3]);
    });

    it('query favorite groups', async () => {
      const teams = await groupDao.queryGroupsByIds([1, 2, 3]);
      expect(teams.map((t: Group) => t.id)).toEqual([3, 2, 1]);
    });

    it('query all groups', async () => {
      const teams = await groupDao.queryAllGroups();
      expect(teams.map((t: Group) => t.id)).toEqual([4, 3, 2, 1]);
    });

    it('query all groups with offset and limit', async () => {
      const teams = await groupDao.queryAllGroups(1, 2);
      expect(teams.map((t: Group) => t.id)).toEqual([3, 2]);
    });

    it('search team', async () => {
      const teams1 = await groupDao.searchTeamByKey('central');
      expect(teams1).toHaveLength(2);

      const team2 = await groupDao.queryGroupByMemberList([234, 123]);
      expect(team2).toHaveLength(1);
    });

    it('get latest group', async () => {
      await expect(groupDao.getLatestGroup()).resolves.toMatchObject({
        id: 2,
        members: [123, 234],
        is_team: false,
        set_abbreviation: 'Nello Huang',
        deactivated: false,
        most_recent_post_created_at: 2,
      });
    });

    it('get last n group', async () => {
      const result = await groupDao.getLastNGroups(3);
      expect(result.map((t: Group) => t.id)).toEqual([4, 3, 2]);
    });
  });
});
