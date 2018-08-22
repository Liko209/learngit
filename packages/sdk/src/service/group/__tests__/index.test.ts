/// <reference path="../../../__tests__/types.d.ts" />
import PersonService from '../../person';
import ProfileService from '../../profile';
import GroupAPI from '../../../api/glip/group';
import { GROUP_QUERY_TYPE, PERMISSION_ENUM } from '../../constants';
import GroupService from '../index';
import { daoManager, AccountDao, GroupDao, ConfigDao } from '../../../dao';
import { Group } from '../../../models';
import handleData, { filterGroups } from '../handleData';
import { groupFactory } from '../../../__tests__/factories';
import Permission from '../permission';

jest.mock('../../../dao');
// jest.mock('../../utils');
jest.mock('../handleData');
jest.mock('../../../service/person');
jest.mock('../../../service/profile');
const profileService = new ProfileService();
const personService = new PersonService();
PersonService.getInstance = jest.fn().mockReturnValue(personService);
ProfileService.getInstance = jest.fn().mockReturnValue(profileService);

jest.mock('../../../api/glip/group');

describe('GroupService', () => {
  const groupService: GroupService = new GroupService();
  const accountDao = new AccountDao(null);
  const groupDao = new GroupDao(null);
  const configDao = new ConfigDao(null);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getGroupsByType()', async () => {
    const mock = [{ id: 1 }, { id: 2 }];
    daoManager.getDao.mockReturnValue(groupDao);

    // GROUP_QUERY_TYPE.ALL
    groupDao.queryAllGroups.mockResolvedValue(mock);
    const result1 = await groupService.getGroupsByType();
    expect(result1).toEqual(mock);

    // GROUP_QUERY_TYPE.FAVORITE
    // profileService.getProfile.mockResolvedValueOnce({ favorite_group_ids: [1] });
    // groupDao.queryGroupsByIds.mockResolvedValue(mock);
    // const result2 = await groupService.getGroupsByType(GROUP_QUERY_TYPE.FAVORITE, 0, 20);
    // expect(result2).toEqual(mock);

    profileService.getProfile.mockResolvedValueOnce({ favorite_group_ids: [] });
    const result22 = await groupService.getGroupsByType(GROUP_QUERY_TYPE.FAVORITE, 0, 20);
    expect(result22).toEqual([]);

    filterGroups.mockResolvedValueOnce(mock);
    // GROUP_QUERY_TYPE.GROUP && GROUP_QUERY_TYPE.TEAM
    groupDao.queryGroups.mockResolvedValue(mock);
    const result3 = await groupService.getGroupsByType(GROUP_QUERY_TYPE.GROUP, 0, 20);
    expect(result3).toEqual(mock);
  });

  it('getLastNGroups()', async () => {
    const mock = [{ id: 1 }, { id: 2 }];
    daoManager.getDao.mockReturnValue(groupDao);
    groupDao.getLastNGroups.mockResolvedValue(mock);
    const result = await groupService.getLastNGroups(1);
    expect(result).toEqual(mock);
  });

  it('getGroupsByIds()', async () => {
    const mock = { id: 1 };
    daoManager.getDao.mockReturnValue(groupDao);
    groupDao.get.mockResolvedValue(mock);

    const result1 = await groupService.getGroupsByIds([]);
    expect(result1).toEqual([]);

    const result2 = await groupService.getGroupsByIds([1]);
    expect(result2).toEqual([mock]);
  });

  it('getGroupById()', async () => {
    const mock = { id: 1 };
    daoManager.getDao.mockReturnValue(groupDao);
    groupDao.get.mockResolvedValue(mock);

    const result = await groupService.getGroupById(1);
    expect(result).toEqual(mock);
  });

  it('getGroupByMemberList()', async () => {
    const mockNormal = [{ id: 1 }, { id: 2 }];
    daoManager.getDao.mockReturnValue(groupDao);

    groupDao.queryGroupByMemberList.mockResolvedValue(mockNormal);
    const result1 = await groupService.getGroupByMemberList([1, 2]);
    expect(result1).toEqual(mockNormal);

    const mockEmpty: Group[] = [];
    groupDao.queryGroupByMemberList.mockResolvedValue(mockEmpty);
    const result2 = await groupService.getGroupByMemberList([1, 2]);
    expect(result2).toEqual(mockEmpty);

    const mockError = null;
    groupDao.queryGroupByMemberList.mockResolvedValue(mockError);
    const result3 = await groupService.getGroupByMemberList([1, 2]);
    expect(result3).toEqual([]);
  });

  it('requestRemoteGroupByMemberList()', async () => {
    daoManager.getKVDao.mockReturnValue(accountDao);
    daoManager.getDao.mockReturnValue(groupDao);
    groupDao.get.mockResolvedValue(1); // userId

    const mockNormal = { data: { _id: 1 } };
    GroupAPI.requestNewGroup.mockResolvedValue(mockNormal);
    const result1 = await groupService.requestRemoteGroupByMemberList([1, 2]);
    expect(result1).toEqual([{ id: 1 }]);

    const mockEmpty = {};
    GroupAPI.requestNewGroup.mockResolvedValue(mockEmpty);
    const result2 = await groupService.requestRemoteGroupByMemberList([1, 2]);
    expect(result2).toEqual([]);

    const mockError = null;
    GroupAPI.requestNewGroup.mockResolvedValue(mockError);
    const result3 = await groupService.requestRemoteGroupByMemberList([1, 2]);
    expect(result3).toEqual([]);
  });

  it('getGroupByPersonId()', async () => {
    const mock = [{ id: 1 }, { id: 2 }];
    daoManager.getKVDao.mockReturnValueOnce(accountDao);
    daoManager.getDao.mockReturnValueOnce(groupDao);
    accountDao.get.mockReturnValue(1); // userId
    groupDao.queryGroupByMemberList.mockResolvedValue(mock);
    const result1 = await groupService.getGroupByPersonId(2);
    expect(result1).toEqual(mock);
  });

  it('getLatestGroup()', async () => {
    const mock = { id: 1 };
    daoManager.getDao.mockReturnValueOnce(groupDao);
    daoManager.getKVDao.mockReturnValueOnce(configDao);
    configDao.get.mockReturnValueOnce(undefined);
    groupDao.getLatestGroup.mockResolvedValue(mock);
    const result = await groupService.getLatestGroup();
    expect(result).toEqual(mock);
  });

  it('getPermissions(group_id)', async () => {
    const mock = [1, 2, 4, 8];
    const group = groupFactory.build({
      permissions: { admin: { uids: [731217923], level: 31 }, user: { uids: [], level: 15 } },
      id: 6037741574,
    });
    const result = await groupService.getPermissions(group);
    expect(result).toEqual(mock);
  });

  it('hasPermission(group_id, type)', async () => {
    const group_id = 6037741574;
    const type = PERMISSION_ENUM.TEAM_PIN_POST;
    jest.spyOn(groupService, 'getById');
    groupService.getById.mockResolvedValue({
      created_at: 1511918848032,
      creator_id: 1394810883,
      description: 'Fiji Core',
      permissions: { admin: { uids: [731217923], level: 31 }, user: { uids: [], level: 15 } },
      id: 6037741574,
    });
    jest.spyOn(daoManager, 'get');
    daoManager.get.mockReturnValueOnce(1394810883);
    const result = await groupService.hasPermissionWithGroupId(group_id, type);
    expect(result).toBe(true);
  });

  // it('levelToPermissionArray(level)', () => {
  //   const mock = [1, 2, 4, 8, 16];
  //   const result = groupService.levelToPermissionArray(31);
  //   expect(result).toEqual(mock);
  // });

  describe('canPinPost()', async () => {
    it('canPinPost()', async () => {
      const mockGroup = groupFactory.build({
        id: 1,
        deactivated: false,
        permissions: { admin: { uids: [731217923], level: 31 }, user: { uids: [], level: 15 } },
        guest_user_company_ids: [],
        is_team: false,
      });
      daoManager.getDao.mockReturnValueOnce(groupDao);
      daoManager.getKVDao.mockReturnValueOnce(accountDao);
      accountDao.get.mockReturnValue(1);
      groupDao.get.mockReturnValueOnce(mockGroup);
      // const group = groupDao.get(1);
      expect(groupService.canPinPost(10, mockGroup)).toBe(true);
      expect(groupService.canPinPost(-1, mockGroup)).toBe(false);

      mockGroup.deactivated = true;
      expect(groupService.canPinPost(10, mockGroup)).toBe(false);
    });
  });

  describe('pinPost()', async () => {
    it('pinPost() with successful path', async () => {
      jest.spyOn(groupService, 'canPinPost');

      const mockGroup = { id: 1, pinned_post_ids: [10] };
      daoManager.getDao.mockReturnValue(groupDao);
      groupDao.get.mockResolvedValueOnce(mockGroup);
      groupService.canPinPost.mockReturnValue(true);
      groupDao.get.mockResolvedValue(mockGroup);

      GroupAPI.pinPost.mockResolvedValueOnce({ data: { _id: 1, pinned_post_ids: [10] } });
      await handleData.mockResolvedValueOnce(null);
      let pinResult = await groupService.pinPost(10, 1, true);
      expect(pinResult.pinned_post_ids).toEqual([10]);

      GroupAPI.pinPost.mockResolvedValueOnce({ data: { _id: 1, pinned_post_ids: [] } });
      await handleData.mockResolvedValueOnce(null);
      pinResult = await groupService.pinPost(10, 1, false);
      console.log(pinResult);
      expect(pinResult.pinned_post_ids).toEqual([]);

      jest.clearAllMocks();
    });

    it('pinPost() with fail path', async () => {
      jest.spyOn(groupService, 'canPinPost');

      const mockGroup = { id: 1, pinned_post_ids: [10] };
      daoManager.getDao.mockReturnValue(groupDao);
      groupDao.get.mockResolvedValue(mockGroup);
      groupService.canPinPost.mockReturnValueOnce(true);

      let pinResult = await groupService.pinPost(10, 1, true);
      expect(pinResult).toBe(null);

      mockGroup.pinned_post_ids = [];
      groupService.canPinPost.mockReturnValueOnce(true);
      pinResult = await groupService.pinPost(10, 1, false);
      expect(pinResult).toBe(null);

      groupService.canPinPost.mockReturnValueOnce(false);
      pinResult = await groupService.pinPost(-1, 1, false);
      expect(pinResult).toBe(null);

      jest.clearAllMocks();
    });

    it('pinPost() with fail path', async () => {
      jest.spyOn(groupService, 'canPinPost');

      const mockGroup = { id: 1, pinned_post_ids: [10] };
      daoManager.getDao.mockReturnValue(groupDao);
      groupDao.get.mockResolvedValue(mockGroup);
      groupService.canPinPost.mockReturnValueOnce(true);

      GroupAPI.pinPost.mockResolvedValueOnce({ error: {} });
      const pinResult = await groupService.pinPost(11, 1, true);
      expect(pinResult).toBe(null);

      jest.clearAllMocks();
    });
  });

  describe('addTeamMembers()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return api result if request success', async () => {
      GroupAPI.addTeamMembers.mockResolvedValueOnce({ data: 122 });
      jest.spyOn(require('../../utils'), 'transform').mockImplementation(source => source + 1);
      await expect(groupService.addTeamMembers(1, [])).resolves.toBe(123);
      expect(GroupAPI.addTeamMembers).toHaveBeenCalledWith(1, []);
    });

    it('should return null if request failed', async () => {
      GroupAPI.addTeamMembers.mockResolvedValueOnce(null);
      await expect(groupService.addTeamMembers(1, [])).resolves.toBeNull();

      GroupAPI.addTeamMembers.mockResolvedValueOnce({ data: null });
      await expect(groupService.addTeamMembers(1, [])).resolves.toBeNull();
    });
  });

  describe('createTeam()', () => {
    const data = {
      set_abbreviation: 'some team',
      members: [1323],
      description: 'abc',
      privacy: 'private',
      permissions: {
        admin: {
          uids: [1323],
        },
        user: {
          uids: [],
          level: 100,
        },
      },
    };
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('privacy should be protected if it is public', async () => {
      await groupService.createTeam('some team', 1323, [], 'abc', {
        isPublic: true,
      });
      expect(GroupAPI.createTeam).toHaveBeenCalledWith(
        Object.assign({}, data, {
          privacy: 'protected',
          permissions: {
            admin: {
              uids: [1323],
            },
            user: {
              uids: [],
              level: 2,
            },
          },
        }),
      );
    });

    it('data should have correct permission level if passed in options', async () => {
      await groupService.createTeam('some team', 1323, [], 'abc', {
        isPublic: true,
        canAddIntegrations: true,
        canAddMember: true,
        canPin: true,
        canPost: true,
      });
      expect(GroupAPI.createTeam).toHaveBeenCalledWith(
        Object.assign({}, data, {
          privacy: 'protected',
          permissions: {
            admin: {
              uids: [1323],
            },
            user: {
              uids: [],
              level: 1 + 2 + 4 + 8,
            },
          },
        }),
      );
    });

    it('should call dependecy apis with correct data', async () => {
      GroupAPI.createTeam.mockResolvedValueOnce({ data: 122 });
      jest.spyOn(require('../../utils'), 'transform').mockImplementation(source => source + 1);
      jest.spyOn(Permission, 'createPermissionsMask').mockReturnValue(100);
      await expect(groupService.createTeam('some team', 1323, [], 'abc')).resolves.toBe(123);
      expect(GroupAPI.createTeam).toHaveBeenCalledWith(data);
      expect(Permission.createPermissionsMask).toHaveBeenCalledWith({
        TEAM_POST: false,
        TEAM_ADD_MEMBER: false,
        TEAM_ADD_INTEGRATIONS: false,
        TEAM_PIN_POST: false,
        TEAM_ADMIN: false,
      });
    });

    it('should return null if request failed', async () => {
      GroupAPI.createTeam.mockResolvedValueOnce(null);
      await expect(groupService.createTeam('some team', 1323, [], 'abc')).resolves.toBeNull();

      GroupAPI.createTeam.mockResolvedValueOnce({ data: null });
      await expect(groupService.createTeam('some team', 1323, [], 'abc')).resolves.toBeNull();
    });
  });
});
