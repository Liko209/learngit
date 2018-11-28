/// <reference path="../../../__tests__/types.d.ts" />
import _ from 'lodash';
import PersonService from '../../person';
import ProfileService from '../../profile';
import AccountService from '../../account';
import GroupAPI from '../../../api/glip/group';
import { GROUP_QUERY_TYPE, PERMISSION_ENUM } from '../../constants';
import GroupService from '../index';
import { daoManager, AccountDao, GroupDao, ConfigDao } from '../../../dao';
import { Group, Raw, Person } from '../../../models';
import handleData, { filterGroups } from '../handleData';
import { groupFactory } from '../../../__tests__/factories';
import Permission from '../permission';
import ServiceCommonErrorType from '../../errors/ServiceCommonErrorType';
import { NetworkResultOk, NetworkResultErr } from '../../../api/NetworkResult';
import { GroupErrorTypes } from '../groupService';
import { ErrorParser, BaseError, TypeDictionary } from '../../../utils';
import { FEATURE_TYPE, FEATURE_STATUS, TeamPermission } from '../../group';
import CompanyService from '../../company';
import { Api } from '../../../api';

jest.mock('../../../dao');
jest.mock('../handleData');
jest.mock('../../../service/person');
jest.mock('../../../service/profile');
jest.mock('../../../service/account');
jest.mock('../../notificationCenter');
jest.mock('../../../service/company');
jest.mock('../../../api/glip/group');

const profileService = new ProfileService();
const personService = new PersonService();
const accountService = new AccountService();

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
    .spyOn<GroupService, any>(groupService, '_doDefaultPartialNotify')
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

  it('getGroupByMemberList()', async () => {
    const mockNormal = { id: 1 };
    const memberIDs = [1, 2];
    // group exist in DB already
    daoManager.getDao.mockReturnValue(groupDao);
    groupDao.queryGroupByMemberList.mockResolvedValue(mockNormal);

    const result1 = await groupService.getOrCreateGroupByMemberList(memberIDs);
    expect(result1).toEqual(mockNormal);

    jest
      .spyOn(groupService, 'requestRemoteGroupByMemberList')
      .mockResolvedValueOnce(mockNormal) // first call
      .mockResolvedValueOnce(null); // second call

    // group not in db, request from server
    const nullGroup: Group = null;
    groupDao.queryGroupByMemberList.mockResolvedValue(nullGroup);
    const result2 = await groupService.getOrCreateGroupByMemberList(memberIDs);
    expect(result2).toEqual(mockNormal);

    // group not in db and server return null
    groupDao.queryGroupByMemberList.mockResolvedValue(nullGroup);
    const result3 = await groupService.getOrCreateGroupByMemberList(memberIDs);
    expect(result3).toBeNull;
  });

  it('requestRemoteGroupByMemberList()', async () => {
    daoManager.getKVDao.mockReturnValue(accountDao);
    daoManager.getDao.mockReturnValue(groupDao);
    groupDao.get.mockResolvedValue(1); // userId

    const mockNormal = new NetworkResultOk({ _id: 1 }, 200, {});
    GroupAPI.requestNewGroup.mockResolvedValue(mockNormal);
    const result1 = await groupService.requestRemoteGroupByMemberList([1, 2]);
    expect(result1).toEqual({ id: 1 });

    const mockEmpty = new NetworkResultOk(null, 200, {});
    GroupAPI.requestNewGroup.mockResolvedValue(mockEmpty);
    const result2 = await groupService.requestRemoteGroupByMemberList([1, 2]);
    expect(result2).toBeNull();

    const mockError = new NetworkResultErr(new BaseError(403, ''), 403, {});
    GroupAPI.requestNewGroup.mockResolvedValue(mockError);
    await expect(
      groupService.requestRemoteGroupByMemberList([1, 2]),
    ).rejects.toThrow();
  });

  it('getGroupByPersonId()', async () => {
    const mock = { id: 2 };
    accountService.getCurrentUserId.mockReturnValueOnce(1);
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

      GroupAPI.pinPost.mockResolvedValueOnce(
        new NetworkResultOk({ _id: 1, pinned_post_ids: [10] }, 200, {}),
      );
      await handleData.mockResolvedValueOnce(null);
      let pinResult = await groupService.pinPost(10, 1, true);
      expect(pinResult.pinned_post_ids).toEqual([10]);

      GroupAPI.pinPost.mockResolvedValueOnce(
        new NetworkResultOk({ _id: 1, pinned_post_ids: [] }, 200, {}),
      );
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

      GroupAPI.pinPost.mockResolvedValueOnce(
        new NetworkResultErr(new BaseError(1, 'error'), 403, {}),
      );
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
      GroupAPI.addTeamMembers.mockResolvedValueOnce(
        new NetworkResultOk(122, 200, {}),
      );
      jest
        .spyOn(require('../../utils'), 'transform')
        .mockImplementationOnce(source => source + 1);
      await expect(groupService.addTeamMembers(1, [])).resolves.toBe(123);
      expect(GroupAPI.addTeamMembers).toHaveBeenCalledWith(1, []);
    });

    it('should return null if request failed', async () => {
      jest.spyOn<GroupService, any>(groupService, 'handleRawGroup');
      groupService.handleRawGroup.mockImplementationOnce(() => {});

      GroupAPI.addTeamMembers.mockResolvedValueOnce(
        new NetworkResultOk(null, 403, {}),
      );

      await groupService.addTeamMembers(1, []);
      expect(groupService.handleRawGroup).toHaveBeenCalledWith(null);
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
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it('privacy should be protected if it is public', async () => {
      jest.spyOn(groupService, 'handleRawGroup');
      groupService.handleRawGroup.mockImplementationOnce(() => {});
      const group: Raw<Group> = _.cloneDeep(data) as Raw<Group>;
      GroupAPI.createTeam.mockResolvedValue(
        new NetworkResultOk(group, 200, {}),
      );
      await groupService.createTeam('some team', 1323, [], 'abc', {
        isPublic: true,
      });
      expect(GroupAPI.createTeam).toHaveBeenCalledWith(
        Object.assign({}, _.cloneDeep(data), {
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
      expect(groupService.handleRawGroup).toHaveBeenCalled();
    });

    it('data should have correct permission level if passed in options', async () => {
      jest.spyOn(groupService, 'handleRawGroup');
      groupService.handleRawGroup.mockImplementationOnce(() => {});
      const group: Raw<Group> = _.cloneDeep(data) as Raw<Group>;
      GroupAPI.createTeam.mockResolvedValue(
        new NetworkResultOk(group, 200, {}),
      );
      await groupService.createTeam('some team', 1323, [], 'abc', {
        isPublic: true,
        canAddIntegrations: true,
        canAddMember: true,
        canPin: true,
        canPost: true,
      });
      expect(GroupAPI.createTeam).toHaveBeenCalledWith(
        Object.assign({}, _.cloneDeep(data), {
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
      jest
        .spyOn(require('../../utils'), 'transform')
        .mockImplementationOnce(source => source + 1);
      jest.spyOn(Permission, 'createPermissionsMask').mockReturnValue(100);
      jest.spyOn<GroupService, any>(groupService, 'handleRawGroup');
      groupService.handleRawGroup.mockImplementationOnce(() => group);
      const group: Raw<Group> = _.cloneDeep(data) as Raw<Group>;
      GroupAPI.createTeam.mockResolvedValue(
        new NetworkResultOk(group, 200, {}),
      );

      const result = await groupService.createTeam(
        'some team',
        1323,
        [],
        'abc',
      );
      expect(result.isOk()).toBeTruthy();
      expect(result).toHaveProperty('data', group);

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
      const error = new BaseError(
        GroupErrorTypes.ALREADY_TAKEN,
        'Already taken',
      );
      GroupAPI.createTeam.mockResolvedValue(
        new NetworkResultErr(error, 403, {}),
      );

      const result = await groupService.createTeam(
        'some team',
        1323,
        [],
        'abc',
      );

      expect(result.isErr()).toBeTruthy();
      expect(result).toHaveProperty('error', error);
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

    it('do fuzzy search of groups, two name match', async () => {
      const result = await groupService.doFuzzySearchGroups('ben, tu');
      expect(result.sortableModels.length).toBe(500);
      expect(result.terms.length).toBe(2);
      expect(result.terms[0]).toBe('ben');
      expect(result.terms[1]).toBe('tu');
    });

    it('do fuzzy search of groups, empty search key', async () => {
      const result = await groupService.doFuzzySearchGroups('');
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(0);
    });

    it('do fuzzy search of groups, empty search key, support fetch all if search key is empty', async () => {
      const result = await groupService.doFuzzySearchGroups('', true);
      expect(result.sortableModels.length).toBe(500);
      expect(result.terms.length).toBe(0);
    });

    it('do fuzzy search of groups, search key is not empty, not support fetch all if search key is empty ', async () => {
      const result = await groupService.doFuzzySearchGroups('ben');
      expect(result.sortableModels.length).toBe(500);
      expect(result.terms.length).toBe(1);
      expect(result.terms[0]).toBe('ben');
    });

    it('do fuzzy search of groups, search key is not empty, support fetch all if search key is empty ', async () => {
      const result = await groupService.doFuzzySearchGroups('ben', true);
      expect(result.sortableModels.length).toBe(500);
      expect(result.terms.length).toBe(1);
      expect(result.terms[0]).toBe('ben');
    });

    it('do fuzzy search of teams, empty search key', async () => {
      const result = await groupService.doFuzzySearchTeams('');
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(0);
    });

    it('do fuzzy search of teams, empty search key, support fetch all if search key is empty', async () => {
      const result = await groupService.doFuzzySearchTeams('', true);
      expect(result.sortableModels.length).toBe(500);
      expect(result.terms.length).toBe(0);
    });

    it('do fuzzy search of teams, undefined search key, support fetch all if search key is empty', async () => {
      const result = await groupService.doFuzzySearchTeams(undefined, true);
      expect(result.sortableModels.length).toBe(500);
      expect(result.terms.length).toBe(0);
    });

    it('do fuzzy search of teams, search key is not empty, not support fetch all if search key is empty ', async () => {
      const result = await groupService.doFuzzySearchTeams('a team name');
      expect(result.sortableModels.length).toBe(500);
      expect(result.terms.length).toBe(3);
      expect(result.terms[0]).toBe('a');
      expect(result.terms[1]).toBe('team');
      expect(result.terms[2]).toBe('name');
    });

    it('do fuzzy search of teams, search key is not empty, support fetch all if search key is empty ', async () => {
      const result = await groupService.doFuzzySearchTeams('a team name', true);
      expect(result.sortableModels.length).toBe(500);
      expect(result.terms.length).toBe(3);
      expect(result.terms[0]).toBe('a');
      expect(result.terms[1]).toBe('team');
      expect(result.terms[2]).toBe('name');
    });
  });

  describe('getOrCreateGroupByMemberList', () => {
    const groupDao = new GroupDao(null);
    const groupService: GroupService = new GroupService();

    beforeEach(() => {
      accountService.getCurrentUserId.mockReturnValueOnce(3);
    });

    const mockNormal = { id: 1 };
    const memberIDs = [1, 2];
    const nullGroup: Group = null;
    it('group exist in DB already', async () => {
      // group exist in DB already

      daoManager.getDao.mockReturnValue(groupDao);
      groupDao.queryGroupByMemberList.mockResolvedValue(mockNormal);
      const result1 = await groupService.getOrCreateGroupByMemberList(
        memberIDs,
      );
      expect(accountService.getCurrentUserId).toBeCalled();
      expect(groupDao.queryGroupByMemberList).toBeCalledWith([1, 2, 3]);
      expect(result1).toEqual(mockNormal);
    });

    it('group not exist in DB already, request from server', async () => {
      jest
        .spyOn(groupService, 'requestRemoteGroupByMemberList')
        .mockResolvedValueOnce(mockNormal); // first call
      groupDao.queryGroupByMemberList.mockResolvedValue(nullGroup);
      const result2 = await groupService.getOrCreateGroupByMemberList(
        memberIDs,
      );
      expect(groupDao.queryGroupByMemberList).toBeCalledWith([1, 2, 3]);
      expect(accountService.getCurrentUserId).toBeCalled();
      expect(result2).toEqual(mockNormal);
    });

    it('throw error ', async () => {
      jest
        .spyOn(groupService, 'requestRemoteGroupByMemberList')
        .mockRejectedValueOnce(new Error('error'));
      daoManager.getDao.mockReturnValue(groupDao);
      groupDao.queryGroupByMemberList.mockResolvedValue(null);
      await expect(
        groupService.getOrCreateGroupByMemberList(memberIDs),
      ).rejects.toThrow();
    });
  });

  describe('requestRemoteGroupByMemberList', () => {
    const groupService: GroupService = new GroupService();
    const accountDao = new AccountDao(null);
    const groupDao = new GroupDao(null);

    beforeEach(() => {
      const curUserId = 3;
      daoManager.getKVDao.mockReturnValue(accountDao);
      accountDao.get.mockReturnValue(3);
      accountService.getCurrentUserId.mockReturnValueOnce(curUserId);
    });
    it('should return a group when request success', async () => {
      const data = { _id: 1 };
      GroupAPI.requestNewGroup.mockResolvedValueOnce(
        new NetworkResultOk(data, 200, {}),
      );
      const result = await groupService.requestRemoteGroupByMemberList([1, 2]);
      expect(result).toMatchObject({ id: 1 });
      expect(GroupAPI.requestNewGroup).toBeCalledWith(
        expect.objectContaining({
          members: [1, 2, 3],
          creator_id: 3,
          is_new: true,
          new_version: expect.any(Number),
        }),
      );
    });

    it('should throw an error when exception happened ', async () => {
      GroupAPI.requestNewGroup.mockResolvedValueOnce(
        new NetworkResultErr(new BaseError(500, 'error'), 500, {}),
      );
      await expect(
        groupService.requestRemoteGroupByMemberList([1, 2]),
      ).rejects.toThrow();
    });
  });

  describe('isFavorited', () => {
    const favGroup = { id: 123 };
    const curUserId = 1;
    const personId = 2;
    const groupIds = [123, 234, 345];

    beforeEach(() => {
      profileService.getProfile.mockResolvedValueOnce({
        favorite_group_ids: groupIds,
      });

      accountService.getCurrentUserId.mockReturnValueOnce(curUserId);
    });
    it("should return true when the person's conversion isfavorted", async () => {
      const spy = jest.spyOn(groupService, 'getLocalGroup');
      const ids: number[] = [personId, curUserId];
      spy.mockResolvedValueOnce(favGroup);
      const res = await groupService.isFavorited(
        personId,
        TypeDictionary.TYPE_ID_PERSON,
      );
      expect(res).toBeTruthy;
    });

    it('should return false when local has no conversation with the person', async () => {
      jest.spyOn(groupService, 'getLocalGroup').mockResolvedValue(null);

      const res = await groupService.isFavorited(
        personId,
        TypeDictionary.TYPE_ID_PERSON,
      );
      expect(res).toBeFalsy;
    });

    it('should return true when the group or team is favorited', async () => {
      const res = await groupService.isFavorited(
        groupIds.indexOf(1),
        TypeDictionary.TYPE_ID_GROUP,
      );
      expect(res).toBeFalsy;

      const res1 = await groupService.isFavorited(
        groupIds.indexOf(2),
        TypeDictionary.TYPE_ID_GROUP,
      );
      expect(res1).toBeFalsy;
    });

    it('should return true when type is not supported', async () => {
      const res = await groupService.isFavorited(
        777,
        TypeDictionary.TYPE_ID_ACCOUNT,
      );
      expect(res).toBeFalsy;
    });
  });

  describe('buildGroupFeatureMap', () => {
    const userId = 3;
    beforeEach(() => {
      accountService.getCurrentUserId.mockReturnValueOnce(userId);
    });

    it('should have message permission when the user is not in group', async () => {
      const group = { id: 10, members: [1, 2, 3] };
      jest.spyOn(groupService, 'getGroupById').mockResolvedValueOnce(group);
      const res = await groupService.buildGroupFeatureMap(group.id);
      expect(res.get(FEATURE_TYPE.MESSAGE)).toBe(FEATURE_STATUS.ENABLE);
    });

    it('should not have message permission when the user is not in group', async () => {
      const group = { id: 10, members: [4, 5, 6] };
      jest.spyOn(groupService, 'getGroupById').mockResolvedValueOnce(group);
      const res = await groupService.buildGroupFeatureMap(group.id);
      expect(res.get(FEATURE_TYPE.MESSAGE)).toBe(FEATURE_STATUS.INVISIBLE);
    });

    it('should has no call permission for group', async () => {
      const group = { id: 10, members: [1, 2, 3] };
      jest.spyOn(groupService, 'getGroupById').mockResolvedValueOnce(group);
      const res = await groupService.buildGroupFeatureMap(group.id);
      expect(res.get(FEATURE_TYPE.CALL)).toBe(FEATURE_STATUS.INVISIBLE);
    });
  });

  describe('isTeamAdmin', async () => {
    it('should return true if no team permission model', async () => {
      expect(groupService.isTeamAdmin(11, undefined)).toBeTruthy;
    });

    it('should return true if person is in admin id list', async () => {
      const permission: TeamPermission = {
        admin: {
          uids: [1, 2, 3],
          level: 31,
        },
        user: {
          uids: [1, 2, 3, 4],
          level: 15,
        },
      };
      expect(groupService.isTeamAdmin(1, permission)).toBeTruthy;
      expect(groupService.isTeamAdmin(2, permission)).toBeTruthy;
      expect(groupService.isTeamAdmin(3, permission)).toBeTruthy;
      expect(groupService.isTeamAdmin(4, permission)).toBeFalsy;
    });
  });

  describe('getGroupEmail', () => {
    const envDomain = 'aws13-g04-uds02.asialab.glip.net';
    const config = {
      glip: {
        server: `https://${envDomain}:11904`,
        cacheServer: 'https://aws13-g04-uds02.asialab.glip.net:11907',
      },
    };

    const companyReplyDomain = 'companyDomain';
    const companyService = new CompanyService();
    beforeEach(() => {
      CompanyService.getInstance = jest.fn().mockReturnValue(companyService);
      companyService.getCompanyEmailDomain.mockResolvedValueOnce(
        companyReplyDomain,
      );

      Object.assign(Api, {
        _httpConfig: config,
      });
    });

    it('should return email address combined with group abbreviation, company domian, env domain', async () => {
      const group = { id: 1, email_friendly_abbreviation: 'group' };
      jest.spyOn(groupService, 'getGroupById').mockResolvedValueOnce(group);

      const res = await groupService.getGroupEmail(group.id);
      expect(res).toBe(
        `${
          group.email_friendly_abbreviation
        }@${companyReplyDomain}.${envDomain}`,
      );
    });

    it('should return email address combined with group id, company domian, env domain', async () => {
      const group = { id: 1 };
      jest.spyOn(groupService, 'getGroupById').mockResolvedValueOnce(group);

      const res = await groupService.getGroupEmail(group.id);
      expect(res).toBe(`${group.id}@${companyReplyDomain}.${envDomain}`);
    });
  });
});
