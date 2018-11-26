/// <reference path="../../../__tests__/types.d.ts" />
import PersonService from '../../person';
import ProfileService from '../../profile';
import AccountService from '../../account';
import GroupAPI from '../../../api/glip/group';
import { GROUP_QUERY_TYPE, PERMISSION_ENUM } from '../../constants';
import GroupService from '../index';
import { daoManager, AccountDao, GroupDao, ConfigDao } from '../../../dao';
import { Group, Person } from '../../../models';
import handleData, { filterGroups } from '../handleData';
import { groupFactory } from '../../../__tests__/factories';
import Permission from '../permission';
import ServiceCommonErrorType from '../../errors/ServiceCommonErrorType';
import { ErrorParser, BaseError } from '../../../utils';

jest.mock('../../../dao');
// jest.mock('../../utils');
jest.mock('../handleData');
jest.mock('../../../service/person');
jest.mock('../../../service/profile');
jest.mock('../../../service/account');
jest.mock('../../notificationCenter');
const profileService = new ProfileService();
const personService = new PersonService();
const accountService = new AccountService();

jest.mock('../../../api/glip/group');

beforeEach(() => {
  jest.clearAllMocks();

  PersonService.getInstance = jest.fn().mockReturnValue(personService);
  ProfileService.getInstance = jest.fn().mockReturnValue(profileService);
  AccountService.getInstance = jest.fn().mockReturnValue(accountService);
});

describe('GroupService', () => {
  const groupService: GroupService = new GroupService();

  jest
    .spyOn(groupService, 'updatePartialModel2Db')
    .mockImplementation(() => {});
  jest
    .spyOn(groupService, '_doDefaultPartialNotify')
    .mockImplementation(() => {});

  const accountDao = new AccountDao(null);
  const groupDao = new GroupDao(null);
  const configDao = new ConfigDao(null);

  beforeEach(() => {});

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
    // TO be fixed

    profileService.getProfile.mockResolvedValueOnce({ favorite_group_ids: [] });
    const result22 = await groupService.getGroupsByType(
      GROUP_QUERY_TYPE.FAVORITE,
      0,
      20,
    );
    expect(result22).toEqual([]);

    filterGroups.mockResolvedValueOnce(mock);
    // GROUP_QUERY_TYPE.GROUP && GROUP_QUERY_TYPE.TEAM
    groupDao.queryGroups.mockResolvedValue(mock);
    const result3 = await groupService.getGroupsByType(
      GROUP_QUERY_TYPE.GROUP,
      0,
      20,
    );
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

  it('getGroupByPersonId()', async () => {
    const mock = { id: 2 };
    accountService.getCurrentUserId.mockResolvedValue(1);
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
    groupDao.getLatestGroup.mockResolvedValueOnce(mock);
    daoManager.getKVDao.mockReturnValueOnce(configDao);
    configDao.get.mockReturnValueOnce(undefined);
    const result = await groupService.getLatestGroup();
    expect(result).toEqual(mock);
  });

  it('getPermissions(group_id)', async () => {
    const mock = [1, 2, 4, 8];
    const group = groupFactory.build({
      permissions: {
        admin: { uids: [731217923], level: 31 },
        user: { uids: [], level: 15 },
      },
      id: 6037741574,
    });
    const result = await groupService.getPermissions(group);
    expect(result).toEqual(mock);
  });

  it('hasPermission(group_id, type)', async () => {
    const group_id = 6037741574;
    const type = PERMISSION_ENUM.TEAM_PIN_POST;
    jest.spyOn(groupService, 'getById');
    daoManager.getKVDao.mockReturnValueOnce(accountDao);
    groupService.getById.mockResolvedValue({
      created_at: 1511918848032,
      creator_id: 1394810883,
      description: 'Fiji Core',
      permissions: {
        admin: { uids: [731217923], level: 31 },
        user: { uids: [], level: 15 },
      },
      id: 6037741574,
    });
    jest.spyOn(daoManager, 'get');
    daoManager.get.mockReturnValueOnce(1394810883);
    const result = await groupService.hasPermissionWithGroupId(group_id, type);
    expect(result).toBe(true);
  });

  it('updateGroupPartialData(object) is update success', async () => {
    const result = await groupService.updateGroupPartialData({
      id: 1,
      abc: '123',
    });
    expect(result).toEqual(true);
  });

  it('updateGroupDraf({id, draft}) is update success', async () => {
    const result = await groupService.updateGroupDraft({
      id: 1,
      draft: 'draft',
    });
    expect(result).toEqual(true);
  });

  it('updateGroupSendFailurePostIds({id, send_failure_post_ids}) is update success', async () => {
    daoManager.getDao.mockReturnValueOnce(groupDao);

    const result = await groupService.updateGroupSendFailurePostIds({
      id: 123,
      send_failure_post_ids: [12, 13],
    });
    expect(result).toEqual(true);
  });

  it('getGroupSendFailurePostIds(id) will be return number array', async () => {
    const mock = { id: 1, send_failure_post_ids: [12, 13] };
    daoManager.getDao.mockReturnValueOnce(groupDao);
    groupDao.get.mockResolvedValueOnce(mock);
    const result = await groupService.getGroupSendFailurePostIds(1);
    expect(result).toEqual(mock.send_failure_post_ids);
  });

  it('getGroupSendFailurePostIds(id) will be return error', async () => {
    daoManager.getDao.mockReturnValueOnce(groupDao);
    groupDao.get.mockRejectedValueOnce(new Error());
    await expect(groupService.getGroupSendFailurePostIds(1)).rejects.toThrow();
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
        permissions: {
          admin: { uids: [731217923], level: 31 },
          user: { uids: [], level: 15 },
        },
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

      GroupAPI.pinPost.mockResolvedValueOnce({
        data: { _id: 1, pinned_post_ids: [10] },
      });
      await handleData.mockResolvedValueOnce(null);
      let pinResult = await groupService.pinPost(10, 1, true);
      expect(pinResult.pinned_post_ids).toEqual([10]);

      GroupAPI.pinPost.mockResolvedValueOnce({
        data: { _id: 1, pinned_post_ids: [] },
      });
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

      expect(pinResult).toBe(undefined);

      jest.clearAllMocks();
    });
  });

  describe('addTeamMembers()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return api result if request success', async () => {
      GroupAPI.addTeamMembers.mockResolvedValueOnce({ data: 122 });
      jest
        .spyOn(require('../../utils'), 'transform')
        .mockImplementationOnce(source => source + 1);
      await expect(groupService.addTeamMembers(1, [])).resolves.toBe(123);
      expect(GroupAPI.addTeamMembers).toHaveBeenCalledWith(1, []);
    });

    it('should return null if request failed', async () => {
      jest.spyOn(groupService, 'handleResponse');
      groupService.handleResponse.mockImplementationOnce(() => {});
      GroupAPI.addTeamMembers.mockResolvedValueOnce(null);

      await groupService.addTeamMembers(1, []);
      expect(groupService.handleResponse).toHaveBeenCalledWith(null);

      GroupAPI.addTeamMembers.mockResolvedValueOnce({ data: null });

      await groupService.addTeamMembers(1, []);
      expect(groupService.handleResponse).toHaveBeenCalledWith({ data: null });
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
      jest.spyOn(groupService, 'handleResponse');
      groupService.handleResponse.mockImplementationOnce(() => {});
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
      expect(groupService.handleResponse).toHaveBeenCalled();
    });

    it('data should have correct permission level if passed in options', async () => {
      jest.spyOn(groupService, 'handleResponse');
      groupService.handleResponse.mockImplementationOnce(() => {});
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

    it('should call dependency apis with correct data', async () => {
      GroupAPI.createTeam.mockResolvedValueOnce({ data: 122 });
      jest
        .spyOn(require('../../utils'), 'transform')
        .mockImplementationOnce(source => source + 1);
      jest.spyOn(Permission, 'createPermissionsMask').mockReturnValue(100);
      await expect(
        groupService.createTeam('some team', 1323, [], 'abc'),
      ).resolves.toBe(123);
      expect(GroupAPI.createTeam).toHaveBeenCalledWith(data);
      expect(Permission.createPermissionsMask).toHaveBeenCalledWith({
        TEAM_POST: false,
        TEAM_ADD_MEMBER: false,
        TEAM_ADD_INTEGRATIONS: false,
        TEAM_PIN_POST: false,
        TEAM_ADMIN: false,
      });
    });

    it('should return error object if duplicate name', async () => {
      const error = {
        message: 'duplicate name',
      };
      GroupAPI.createTeam.mockResolvedValueOnce({
        data: {
          error,
        },
      });
      const ret = await groupService.createTeam('some team', 1323, [], 'abc');
      expect(ret).toEqual({ error });
    });
  });

  describe('get left rail conversations', () => {
    it('get left rail conversations', async () => {
      daoManager.getDao.mockReturnValue(groupDao);
      groupDao.queryGroupsByIds.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
      groupDao.queryGroups.mockResolvedValueOnce([{ id: 3 }]);
      groupDao.queryGroups.mockResolvedValueOnce([{ id: 4 }]);
      const groups = await groupService.getLeftRailGroups();
      expect(groups.length).toBe(2);
    });
  });

  describe('hideConversation', () => {
    it('hideConversation, success', async () => {
      profileService.hideConversation.mockResolvedValueOnce({
        id: 1,
        hide_group_123: true,
      });
      const result = await groupService.hideConversation(1, false, true);
      expect(result).toBe(ServiceCommonErrorType.NONE);
    });
    it('hideConversation, network not available', async () => {
      profileService.hideConversation.mockResolvedValueOnce(
        new BaseError(5000, ''),
      );
      const result = await groupService.hideConversation(1, false, true);
      expect(result).toBe(ServiceCommonErrorType.NETWORK_NOT_AVAILABLE);
    });
    it('hideConversation, server error', async () => {
      profileService.hideConversation.mockResolvedValueOnce(
        new BaseError(5403, ''),
      );
      const result = await groupService.hideConversation(1, false, true);
      expect(result).toBe(ServiceCommonErrorType.SERVER_ERROR);
    });
    it('hideConversation, unknown error', async () => {
      profileService.hideConversation.mockResolvedValueOnce(
        ErrorParser.parse({ status: 280 }),
      );
      const result = await groupService.hideConversation(1, false, true);
      expect(result).toBe(ServiceCommonErrorType.UNKNOWN_ERROR);
    });
  });

  describe('doFuzzySearch', () => {
    function prepareGroupsForSearch() {
      personService.enableCache();
      accountService.getCurrentUserId = jest.fn().mockImplementation(() => 1);

      const person1: Person = {
        id: 11001,
        created_at: 1,
        modified_at: 1,
        creator_id: 1,
        is_new: false,
        deactivated: false,
        version: 1,
        company_id: 1,
        email: 'ben1.niu1@ringcentral.com',
        me_group_id: 1,
        first_name: 'ben1',
        last_name: 'niu1',
        display_name: 'ben1 niu1',
      };

      const person2: Person = {
        id: 12001,
        created_at: 1,
        modified_at: 1,
        creator_id: 1,
        is_new: false,
        deactivated: false,
        version: 1,
        company_id: 1,
        email: 'tu1.tu1@ringcentral.com',
        me_group_id: 1,
        first_name: 'tu1',
        last_name: 'tu1',
        display_name: 'tu1 tu1',
      };

      personService.getEntityFromCache = jest
        .fn()
        .mockImplementation((id: number) => (id <= 12000 ? person1 : person2));

      personService.getName = jest
        .fn()
        .mockImplementation((person: Person) =>
          person.id > 12000 ? 'ben1' : 'tu1',
        );

      groupService.enableCache();

      const userId = 1;
      // prepare one : one
      for (let i = 10000; i <= 11000; i += 1) {
        const group: Group = {
          id: i,
          created_at: i,
          modified_at: i,
          creator_id: i,
          is_new: false,
          deactivated: i % 2 === 0,
          version: i,
          members: [userId, i],
          company_id: i,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: i,
        };
        groupService.getCacheManager().set(group);
      }

      // prepare multi members as a group
      for (let i = 11001; i <= 12000; i += 1) {
        const group: Group = {
          id: i,
          created_at: i,
          modified_at: i,
          creator_id: i,
          is_new: false,
          is_team: false,
          deactivated: i % 2 === 0,
          version: i,
          members: [userId, i, i + 1000],
          company_id: i,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: i,
        };
        groupService.getCacheManager().set(group);
      }

      // prepare teams
      // prepare multi members as a group
      for (let i = 12001; i <= 13000; i += 1) {
        const group: Group = {
          id: i,
          created_at: i,
          modified_at: i,
          creator_id: i,
          is_team: true,
          is_new: false,
          is_archived: false,
          is_public: i % 2 === 0,
          deactivated: i % 2 !== 0,
          version: i,
          members: i % 2 === 0 ? [userId, i, i + 1000] : [i, i + 1000],
          company_id: i,
          set_abbreviation: `this is a team name${i.toString()}`,
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: i,
        };
        groupService.getCacheManager().set(group);
      }
    }

    prepareGroupsForSearch();

    it('do fuzzy search of groups', async () => {
      const result = await groupService.doFuzzySearchGroups('ben');
      expect(result.sortableModels.length).toBe(500);
      expect(result.terms.length).toBe(1);
      expect(result.terms[0]).toBe('ben');
    });

    it('do fuzzy search of groups, two name match', async () => {
      const result = await groupService.doFuzzySearchGroups('ben, tu');
      expect(result.sortableModels.length).toBe(500);
      expect(result.terms.length).toBe(2);
      expect(result.terms[0]).toBe('ben');
      expect(result.terms[1]).toBe('tu');
    });

    it('do fuzzy search of teams', async () => {
      const result = await groupService.doFuzzySearchTeams('a team name');
      expect(result.sortableModels.length).toBe(500);
      expect(result.terms.length).toBe(3);
      expect(result.terms[0]).toBe('a');
      expect(result.terms[1]).toBe('team');
      expect(result.terms[2]).toBe('name');
    });
  });

  describe('getGroupByMemberList', () => {
    const groupDao = new GroupDao(null);
    const groupService: GroupService = new GroupService();

    beforeEach(() => {
      accountService.getCurrentUserId.mockResolvedValue(1);
    });

    const mockNormal = { id: 1 };
    const memberIDs = [1, 2];
    const nullGroup: Group = null;
    it('group exist in DB already', async () => {
      // group exist in DB already

      daoManager.getDao.mockReturnValue(groupDao);
      groupDao.queryGroupByMemberList.mockResolvedValue(mockNormal);
      const result1 = await groupService.getGroupByMemberList(memberIDs);
      expect(result1).toEqual(mockNormal);
    });

    it('group not exist in DB already, request from server', async () => {
      jest
        .spyOn(groupService, 'requestRemoteGroupByMemberList')
        .mockResolvedValueOnce(mockNormal); // first call
      groupDao.queryGroupByMemberList.mockResolvedValue(nullGroup);
      const result2 = await groupService.getGroupByMemberList(memberIDs);
      expect(result2).toEqual(mockNormal);
    });

    it('throw error ', async () => {
      jest
        .spyOn(groupService, 'requestRemoteGroupByMemberList')
        .mockRejectedValueOnce(new Error('error'));
      daoManager.getDao.mockReturnValue(groupDao);
      groupDao.queryGroupByMemberList.mockResolvedValue(null);
      await expect(
        groupService.getGroupByMemberList(memberIDs),
      ).rejects.toThrow();
    });
  });

  describe('requestRemoteGroupByMemberList', () => {
    const groupService: GroupService = new GroupService();
    const accountDao = new AccountDao(null);
    const groupDao = new GroupDao(null);

    it('requestRemoteGroupByMemberList success', async () => {
      daoManager.getKVDao.mockReturnValue(accountDao);
      // accountDao.get.mockReturnValue(1);
      daoManager.getDao.mockReturnValue(groupDao);
      groupDao.get.mockResolvedValue(1); // userId

      const mockNormal = { data: { _id: 1 } };
      GroupAPI.requestNewGroup.mockResolvedValueOnce(mockNormal);
      const result1 = await groupService.requestRemoteGroupByMemberList([1, 2]);
      expect(result1).toMatchObject({ id: 1 });
    });

    it('requestRemoteGroupByMemberList server return null', async () => {
      const mockEmpty = { data: null };
      GroupAPI.requestNewGroup.mockResolvedValueOnce(mockEmpty);
      const result2 = await groupService.requestRemoteGroupByMemberList([1, 2]);
      expect(result2).toBeNull;
    });

    it('requestRemoteGroupByMemberList throw error ', async () => {
      GroupAPI.requestNewGroup.mockRejectedValueOnce(new Error('error'));
      await expect(
        groupService.requestRemoteGroupByMemberList([1, 2]),
      ).rejects.toThrow();
    });
  });
});
