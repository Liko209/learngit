/// <reference path="../../../../__tests__/types.d.ts" />
import {
  BaseResponse,
  err,
  ERROR_CODES_NETWORK,
  JNetworkError,
  ok,
} from 'foundation';
import _ from 'lodash';

import { groupFactory } from '../../../../__tests__/factories';
import { Api } from '../../../../api';
import { ApiResultErr, ApiResultOk } from '../../../../api/ApiResult';
import GroupAPI from '../../../../api/glip/group';
import {
  AccountDao,
  ConfigDao,
  daoManager,
  GroupConfigDao,
} from '../../../../dao';
import { TestEntityCacheSearchController } from '../../../../framework/__mocks__/controller/TestEntityCacheSearchController';
import { TestEntitySourceController } from '../../../../framework/__mocks__/controller/TestEntitySourceController';
import { TestPartialModifyController } from '../../../../framework/__mocks__/controller/TestPartialModifyController';
import { EntityCacheController } from '../../../../framework/controller/impl/EntityCacheController';
import { IEntityCacheSearchController } from '../../../../framework/controller/interface/IEntityCacheSearchController';
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';
import { IPartialModifyController } from '../../../../framework/controller/interface/IPartialModifyController';
import { IRequestController } from '../../../../framework/controller/interface/IRequestController';
import { UserConfig } from '../../../../service/account/UserConfig';
import CompanyService from '../../../../service/company';
import { GROUP_QUERY_TYPE } from '../../../../service/constants';
import { NewPostService } from '../../../post';
import ProfileService from '../../../../service/profile';
import { TypeDictionary } from '../../../../utils';
import { PersonService } from '../../../person';
import { Person } from '../../../person/entity';
import { GroupDao } from '../../dao';
import { Group, TeamPermission } from '../../entity';
import { GroupService } from '../../index';
import { GroupFetchDataController } from '../GroupFetchDataController';
import { GroupHandleDataController } from '../GroupHandleDataController';

jest.mock('../../../../dao');
jest.mock('../../../../framework/controller/impl/EntityPersistentController');
jest.mock('../../../person');
jest.mock('../../dao');
jest.mock('../../../../service/profile');
jest.mock('../../../../service/account/UserConfig');
jest.mock('../../../../service/notificationCenter');
jest.mock('../../../../service/company');
jest.mock('../../../post');
jest.mock('sdk/api');
jest.mock('sdk/api/glip/group');

class TestRequestController implements IRequestController<Group> {
  get = jest.fn();
  put = jest.fn();
  post = jest.fn();
}

const profileService = new ProfileService();
const personService = new PersonService();
beforeEach(() => {
  jest.clearAllMocks();

  PersonService.getInstance = jest.fn().mockReturnValue(personService);
  ProfileService.getInstance = jest.fn().mockReturnValue(profileService);
});

describe('GroupFetchDataController', () => {
  let testEntitySourceController: IEntitySourceController<Group>;
  let groupFetchDataController: GroupFetchDataController;
  let testPartialModifyController: IPartialModifyController<Group>;
  let testRequestController: TestRequestController;
  let entityCacheController: EntityCacheController;
  let testEntityCacheSearchController: IEntityCacheSearchController<Group>;
  let groupService: GroupService;

  const accountDao = new AccountDao(null);
  const groupDao = new GroupDao(null);
  const configDao = new ConfigDao(null);
  const groupConfigDao = new GroupConfigDao(null);
  const postService = new NewPostService();
  const mockUserId = 1;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    UserConfig.getCurrentUserId = jest
      .fn()
      .mockImplementation(() => mockUserId);
    NewPostService.getInstance = jest.fn().mockReturnValue(postService);

    testEntitySourceController = new TestEntitySourceController<Group>(
      groupFactory,
    );
    testEntitySourceController.get.mockImplementation((id: number) =>
      groupFactory.build({ id }),
    );
    testPartialModifyController = new TestPartialModifyController(
      testEntitySourceController,
    );
    testRequestController = new TestRequestController();
    entityCacheController = new EntityCacheController();
    testEntityCacheSearchController = new TestEntityCacheSearchController(
      entityCacheController,
    );
    groupService = new GroupService();
    groupFetchDataController = new GroupFetchDataController(
      groupService,
      testEntitySourceController,
      testPartialModifyController,
      testEntityCacheSearchController,
      new GroupHandleDataController(),
    );
  });

  it('getGroupsByType()', async () => {
    const mock = [{ id: 1 }, { id: 2 }];
    daoManager.getDao.mockReturnValue(groupDao);

    // GROUP_QUERY_TYPE.ALL
    groupDao.queryAllGroups.mockResolvedValue(mock);
    const result1 = await groupFetchDataController.getGroupsByType();
    expect(result1).toEqual(mock);

    // GROUP_QUERY_TYPE.FAVORITE
    // profileService.getProfile.mockResolvedValueOnce({ favorite_group_ids: [1] });
    // groupDao.queryGroupsByIds.mockResolvedValue(mock);
    // const result2 = await groupService.getGroupsByType(GROUP_QUERY_TYPE.FAVORITE, 0, 20);
    // expect(result2).toEqual(mock);
    // TO be fixed

    profileService.getProfile.mockResolvedValueOnce({ favorite_group_ids: [] });
    const result22 = await groupFetchDataController.getGroupsByType(
      GROUP_QUERY_TYPE.FAVORITE,
      0,
      20,
    );
    expect(result22).toEqual([]);
    jest.spyOn(
      groupFetchDataController.groupHandleDataController,
      'filterGroups',
    );
    groupFetchDataController.groupHandleDataController.filterGroups.mockResolvedValueOnce(
      mock,
    );
    // GROUP_QUERY_TYPE.GROUP && GROUP_QUERY_TYPE.TEAM
    groupDao.queryGroups.mockResolvedValue(mock);
    const result3 = await groupFetchDataController.getGroupsByType(
      GROUP_QUERY_TYPE.GROUP,
      0,
      20,
    );
    expect(result3).toEqual(mock);
  });

  it('getGroupsByIds()', async () => {
    const mock = { id: 1 };
    testEntitySourceController.get.mockResolvedValue(mock);

    const result1 = await groupFetchDataController.getGroupsByIds([]);
    expect(result1).toEqual([]);

    const result2 = await groupFetchDataController.getGroupsByIds([1]);
    expect(result2).toEqual([mock]);
  });

  describe('getLocalGroup()', () => {
    it('should call groupDao with personIds append self id', async () => {
      await groupFetchDataController.getLocalGroup([11, 12]);
      expect(groupDao.queryGroupByMemberList).toBeCalledWith([
        11,
        12,
        mockUserId,
      ]);
    });
  });
  describe('getGroupByMemberList()', async () => {
    it('should return result with group if it already existed in local', async () => {
      const mockNormal = { id: 1 };
      const memberIDs = [1, 2];
      // group exist in DB already
      daoManager.getDao.mockReturnValue(groupDao);
      groupDao.queryGroupByMemberList.mockResolvedValue(mockNormal);
      const result1 = await groupFetchDataController.getOrCreateGroupByMemberList(
        memberIDs,
      );
      expect(result1).toHaveProperty('data', mockNormal);
    });

    it('should return result with group if it can get from remote', async () => {
      const mockNormal = { id: 1 };
      const memberIDs = [1, 2];
      jest
        .spyOn(groupFetchDataController, 'requestRemoteGroupByMemberList')
        .mockResolvedValueOnce(ok(mockNormal));
      groupDao.queryGroupByMemberList.mockResolvedValueOnce(null);
      const result = await groupFetchDataController.getOrCreateGroupByMemberList(
        memberIDs,
      );
      expect(result).toHaveProperty('data', mockNormal);
    });

    it('should return result with error if it can not get from remote', async () => {
      const memberIDs = [1, 2];
      jest
        .spyOn(groupFetchDataController, 'requestRemoteGroupByMemberList')
        .mockResolvedValueOnce(
          err(new JNetworkError(ERROR_CODES_NETWORK.INTERNAL_SERVER_ERROR, '')),
        );
      groupDao.queryGroupByMemberList.mockResolvedValueOnce(null);
      const result = await groupFetchDataController.getOrCreateGroupByMemberList(
        memberIDs,
      );
      expect(result.isErr()).toBe(true);
    });
  });

  it('requestRemoteGroupByMemberList()', async () => {
    daoManager.getKVDao.mockReturnValue(accountDao);
    daoManager.getDao.mockReturnValue(groupDao);
    groupDao.get.mockResolvedValue(1); // userId

    const mockNormal = new ApiResultOk({ _id: 1 }, {
      status: 200,
      headers: {},
    } as BaseResponse);
    GroupAPI.requestNewGroup.mockResolvedValue(mockNormal);
    const result1 = await groupFetchDataController.requestRemoteGroupByMemberList(
      [1, 2],
    );
    expect(result1).toHaveProperty('data', { id: 1 });

    const mockEmpty = new ApiResultOk(null, {
      status: 200,
      headers: {},
    } as BaseResponse);
    GroupAPI.requestNewGroup.mockResolvedValue(mockEmpty);
    const result2 = await groupFetchDataController.requestRemoteGroupByMemberList(
      [1, 2],
    );
    expect(result2).toHaveProperty('data', null);

    const mockError = new ApiResultErr(
      new JNetworkError(ERROR_CODES_NETWORK.FORBIDDEN, ''),
      {
        status: 403,
        headers: {},
      } as BaseResponse,
    );
    GroupAPI.requestNewGroup.mockResolvedValue(mockError);
    const result3 = await groupFetchDataController.requestRemoteGroupByMemberList(
      [1, 2],
    );
    expect(result3.isOk()).toBe(false);
  });

  it('getGroupByPersonId()', async () => {
    const mock = { id: 2 };
    UserConfig.getCurrentUserId.mockReturnValueOnce(1);
    daoManager.getKVDao.mockReturnValueOnce(accountDao);
    daoManager.getDao.mockReturnValueOnce(groupDao);
    accountDao.get.mockReturnValue(1); // userId
    groupDao.queryGroupByMemberList.mockResolvedValue(mock);
    const result1 = await groupFetchDataController.getGroupByPersonId(2);
    expect(result1).toHaveProperty('data', mock);
  });

  describe('get left rail conversations', () => {
    it('get left rail conversations', async () => {
      const mock = [{ id: 1 }, { id: 2 }];
      daoManager.getDao.mockReturnValue(groupDao);
      groupDao.queryGroupsByIds.mockResolvedValue(mock);
      groupDao.queryGroups.mockResolvedValue([{ id: 3 }]);
      jest.spyOn(
        groupFetchDataController.groupHandleDataController,
        'filterGroups',
      );
      groupFetchDataController.groupHandleDataController.filterGroups.mockResolvedValue(
        mock,
      );
      const groups = await groupFetchDataController.getLeftRailGroups();
      expect(groups.length).toBe(4);
    });
  });

  describe('doFuzzySearch', () => {
    function prepareGroupsForSearch() {
      UserConfig.getCurrentUserId = jest.fn().mockImplementation(() => 1);

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

      personService.getById = jest
        .fn()
        .mockImplementation((id: number) => (id <= 12000 ? person1 : person2));

      personService.getName = jest
        .fn()
        .mockImplementation((person: Person) =>
          person.id > 12000 ? 'ben1' : 'tu1',
        );

      const userId = mockUserId;
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
          is_company_team: false,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: i,
        };
        entityCacheController.put(group);
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
          is_company_team: false,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: i,
        };
        entityCacheController.put(group);
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
          privacy: i % 2 === 0 ? 'protected' : 'private',
          deactivated: i % 2 !== 0,
          version: i,
          members: i % 2 === 0 ? [userId, i, i + 1000] : [i, i + 1000],
          company_id: i,
          is_company_team: false,
          set_abbreviation: `this is a team name${i.toString()}`,
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: i,
        };
        entityCacheController.put(group);
      }

      for (let i = 13001; i <= 13010; i += 1) {
        const group: Group = {
          id: i,
          created_at: i,
          modified_at: i,
          creator_id: i,
          is_team: true,
          is_new: false,
          is_archived: false,
          privacy: i % 2 === 0 ? 'protected' : 'private',
          deactivated: i % 2 !== 0,
          version: i,
          members: i % 2 === 0 ? [userId, i, i + 1000] : [i, i + 1000],
          company_id: i,
          is_company_team: false,
          set_abbreviation: `Team name of ${i.toString()}`,
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: i,
        };
        entityCacheController.put(group);
      }
    }
    beforeEach(() => {
      entityCacheController.clear();
      prepareGroupsForSearch();
    });

    it('do fuzzy search of groups, two name match', async () => {
      const result = await groupFetchDataController.doFuzzySearchGroups(
        'ben, tu',
      );
      expect(result.sortableModels.length).toBe(500);
      expect(result.terms.length).toBe(2);
      expect(result.terms[0]).toBe('ben');
      expect(result.terms[1]).toBe('tu');
    });

    it('do fuzzy search of groups, empty search key', async () => {
      const result = await groupFetchDataController.doFuzzySearchGroups('');
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(0);
    });

    it('do fuzzy search of groups, empty search key, support fetch all if search key is empty', async () => {
      const result = await groupFetchDataController.doFuzzySearchGroups(
        '',
        true,
      );
      expect(result.sortableModels.length).toBe(500);
      expect(result.terms.length).toBe(0);
    });

    it('do fuzzy search of groups, search key is not empty, not support fetch all if search key is empty ', async () => {
      const result = await groupFetchDataController.doFuzzySearchGroups('ben');
      expect(result.sortableModels.length).toBe(500);
      expect(result.terms.length).toBe(1);
      expect(result.terms[0]).toBe('ben');
    });

    it('do fuzzy search of groups, search key is not empty, support fetch all if search key is empty ', async () => {
      const result = await groupFetchDataController.doFuzzySearchGroups(
        'ben',
        true,
      );
      expect(result.sortableModels.length).toBe(500);
      expect(result.terms.length).toBe(1);
      expect(result.terms[0]).toBe('ben');
    });

    it('do fuzzy search of teams, empty search key', async () => {
      const result = await groupFetchDataController.doFuzzySearchTeams('');
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(0);
    });

    it('do fuzzy search of teams, empty search key, support fetch all if search key is empty', async () => {
      const result = await groupFetchDataController.doFuzzySearchTeams(
        '',
        true,
      );
      expect(result.sortableModels.length).toBe(505);
      expect(result.terms.length).toBe(0);
    });

    it('do fuzzy search of teams, undefined search key, support fetch all if search key is empty', async () => {
      const result = await groupFetchDataController.doFuzzySearchTeams(
        undefined,
        true,
      );
      expect(result.sortableModels.length).toBe(505);
      expect(result.terms.length).toBe(0);
    });

    it('do fuzzy search of teams, search key is not empty, not support fetch all if search key is empty ', async () => {
      const result = await groupFetchDataController.doFuzzySearchTeams(
        'this team name',
      );
      expect(result.sortableModels.length).toBe(500);
      expect(result.terms.length).toBe(3);
      expect(result.terms[0]).toBe('this');
      expect(result.terms[1]).toBe('team');
      expect(result.terms[2]).toBe('name');
    });

    it('do fuzzy search of teams, search key is not empty, support fetch all if search key is empty ', async () => {
      const result = await groupFetchDataController.doFuzzySearchTeams(
        'this team name',
        true,
      );
      expect(result.sortableModels.length).toBe(500);
      expect(result.terms.length).toBe(3);
      expect(result.terms[0]).toBe('this');
      expect(result.terms[1]).toBe('team');
      expect(result.terms[2]).toBe('name');
    });
  });

  describe('doFuzzySearchTeamWithPriority', () => {
    const team1: Group = {
      id: 1,
      created_at: 1,
      modified_at: 1,
      creator_id: 1,
      is_team: true,
      is_new: false,
      is_archived: false,
      privacy: 'protected',
      deactivated: false,
      version: 1,
      members: [1, 2],
      company_id: 1,
      is_company_team: false,
      set_abbreviation: 'Jupiter Access',
      email_friendly_abbreviation: '',
      most_recent_content_modified_at: 1,
    };

    const team2: Group = {
      id: 2,
      created_at: 1,
      modified_at: 1,
      creator_id: 1,
      is_team: true,
      is_new: false,
      is_archived: false,
      privacy: 'protected',
      deactivated: false,
      version: 1,
      members: [1, 2],
      company_id: 1,
      is_company_team: false,
      set_abbreviation: 'Access Jupiter',
      email_friendly_abbreviation: '',
      most_recent_content_modified_at: 1,
    };

    const team3: Group = {
      id: 3,
      created_at: 1,
      modified_at: 1,
      creator_id: 1,
      is_team: true,
      is_new: false,
      is_archived: false,
      privacy: 'protected',
      deactivated: false,
      version: 1,
      members: [1, 2],
      company_id: 1,
      is_company_team: false,
      set_abbreviation: 'Jupiter Engineer',
      email_friendly_abbreviation: '',
      most_recent_content_modified_at: 1,
    };

    const team4: Group = {
      id: 4,
      created_at: 1,
      modified_at: 1,
      creator_id: 1,
      is_team: true,
      is_new: false,
      is_archived: false,
      privacy: 'protected',
      deactivated: false,
      version: 1,
      members: [1, 2],
      company_id: 1,
      is_company_team: false,
      set_abbreviation: 'Engineer Jupiter',
      email_friendly_abbreviation: '',
      most_recent_content_modified_at: 1,
    };

    function prepareGroupsForSearch() {
      UserConfig.getCurrentUserId = jest.fn().mockImplementation(() => 1);

      entityCacheController.put(team1);
      entityCacheController.put(team2);
      entityCacheController.put(team3);
      entityCacheController.put(team4);
    }

    beforeEach(() => {
      entityCacheController.clear();
      prepareGroupsForSearch();
    });

    it('should show correct', async () => {
      const result = await groupFetchDataController.doFuzzySearchTeams(
        'Jupiter, E',
      );
      expect(result.sortableModels.length).toBe(4);
      expect(result.sortableModels[0].entity).toEqual(team3);
      expect(result.sortableModels[1].entity).toEqual(team4);
      expect(result.sortableModels[2].entity).toEqual(team1);
      expect(result.sortableModels[3].entity).toEqual(team2);
    });
  });

  describe('getOrCreateGroupByMemberList', () => {
    const groupDao = new GroupDao(null);

    beforeEach(() => {
      UserConfig.getCurrentUserId.mockReturnValueOnce(3);
    });

    const mockNormal = { id: 1 };
    const memberIDs = [1, 2];
    const nullGroup: Group = null;
    it('group exist in DB already', async () => {
      // group exist in DB already

      daoManager.getDao.mockReturnValue(groupDao);
      groupDao.queryGroupByMemberList.mockResolvedValue(mockNormal);
      const result1 = await groupFetchDataController.getOrCreateGroupByMemberList(
        memberIDs,
      );
      expect(UserConfig.getCurrentUserId).toBeCalled();
      expect(groupDao.queryGroupByMemberList).toBeCalledWith([1, 2, 3]);
      expect(result1).toHaveProperty('data', mockNormal);
    });

    it('group not exist in DB already, request from server', async () => {
      jest
        .spyOn(groupFetchDataController, 'requestRemoteGroupByMemberList')
        .mockResolvedValueOnce(ok(mockNormal)); // first call
      daoManager.getDao.mockReturnValue(groupDao);
      groupDao.queryGroupByMemberList.mockResolvedValue(nullGroup);
      const result2 = await groupFetchDataController.getOrCreateGroupByMemberList(
        memberIDs,
      );
      expect(groupDao.queryGroupByMemberList).toBeCalledWith([1, 2, 3]);
      expect(UserConfig.getCurrentUserId).toBeCalled();
      expect(result2).toHaveProperty('data', mockNormal);
    });

    it('throw error ', async () => {
      jest
        .spyOn(groupFetchDataController, 'requestRemoteGroupByMemberList')
        .mockResolvedValueOnce(
          err(new JNetworkError(ERROR_CODES_NETWORK.INTERNAL_SERVER_ERROR, '')),
        );
      daoManager.getDao.mockReturnValue(groupDao);
      groupDao.queryGroupByMemberList.mockResolvedValue(null);
      const result = await groupFetchDataController.getOrCreateGroupByMemberList(
        memberIDs,
      );
      expect(result.isOk()).toBe(false);
    });
  });

  describe('requestRemoteGroupByMemberList', () => {
    const accountDao = new AccountDao(null);

    beforeEach(() => {
      const curUserId = 3;
      daoManager.getKVDao.mockReturnValue(accountDao);
      accountDao.get.mockReturnValue(3);
      UserConfig.getCurrentUserId.mockReturnValueOnce(curUserId);
    });
    it('should return a group when request success', async () => {
      const data = { _id: 1 };
      GroupAPI.requestNewGroup.mockResolvedValueOnce(
        new ApiResultOk(data, {
          status: 200,
          headers: {},
        } as BaseResponse),
      );
      const result = await groupFetchDataController.requestRemoteGroupByMemberList(
        [1, 2],
      );
      expect(result).toHaveProperty('data', { id: 1 });
      expect(GroupAPI.requestNewGroup).toBeCalledWith(
        expect.objectContaining({
          members: [1, 2, 3],
          creator_id: mockUserId,
          is_new: true,
          new_version: expect.any(Number),
        }),
      );
    });

    it('should throw an error when exception happened ', async () => {
      GroupAPI.requestNewGroup.mockResolvedValueOnce(
        new ApiResultErr(
          new JNetworkError(ERROR_CODES_NETWORK.INTERNAL_SERVER_ERROR, 'error'),
            {
              status: 500,
              headers: {},
            } as BaseResponse,
        ),
      );
      const result = await groupFetchDataController.requestRemoteGroupByMemberList(
        [1, 2],
      );
      expect(result.isErr()).toBe(true);
    });
  });

  describe('isFavored', () => {
    const favGroup = { id: 123 };
    const curUserId = 1;
    const personId = 2;
    const groupIds = [123, 234, 345];

    beforeEach(() => {
      profileService.getProfile.mockResolvedValueOnce({
        favorite_group_ids: groupIds,
      });

      UserConfig.getCurrentUserId.mockReturnValueOnce(curUserId);
    });
    it("should return true when the person's conversion is favored", async () => {
      const spy = jest.spyOn(groupService, 'getLocalGroup');
      const ids: number[] = [personId, curUserId];
      spy.mockResolvedValueOnce(favGroup);
      const res = await groupFetchDataController.isFavored(
        personId,
        TypeDictionary.TYPE_ID_PERSON,
      );
      expect(res).toBeTruthy;
    });

    it('should return false when local has no conversation with the person', async () => {
      jest.spyOn(groupService, 'getLocalGroup').mockResolvedValue(null);

      const res = await groupFetchDataController.isFavored(
        personId,
        TypeDictionary.TYPE_ID_PERSON,
      );
      expect(res).toBeFalsy;
    });

    it('should return true when the group or team is favored', async () => {
      const res = await groupFetchDataController.isFavored(
        groupIds.indexOf(1),
        TypeDictionary.TYPE_ID_GROUP,
      );
      expect(res).toBeFalsy;

      const res1 = await groupFetchDataController.isFavored(
        groupIds.indexOf(2),
        TypeDictionary.TYPE_ID_GROUP,
      );
      expect(res1).toBeFalsy;
    });

    it('should return true when type is not supported', async () => {
      const res = await groupFetchDataController.isFavored(
        777,
        TypeDictionary.TYPE_ID_ACCOUNT,
      );
      expect(res).toBeFalsy;
    });
  });

  describe('isTeamAdmin', async () => {
    it('should return true if no team permission model', async () => {
      expect(groupFetchDataController.isTeamAdmin(11, undefined)).toBeTruthy;
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
      expect(groupFetchDataController.isTeamAdmin(1, permission)).toBeTruthy;
      expect(groupFetchDataController.isTeamAdmin(2, permission)).toBeTruthy;
      expect(groupFetchDataController.isTeamAdmin(3, permission)).toBeTruthy;
      expect(groupFetchDataController.isTeamAdmin(4, permission)).toBeFalsy;
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
        httpConfig: config,
      });
    });

    it('should return email address combined with group abbreviation, company domian, env domain', async () => {
      const group = { id: 1, email_friendly_abbreviation: 'group' };
      testEntitySourceController.get.mockResolvedValueOnce(group);

      const res = await groupFetchDataController.getGroupEmail(group.id);
      expect(res).toBe(
        `${
          group.email_friendly_abbreviation
        }@${companyReplyDomain}.${envDomain}`,
      );
    });

    it('should return email address combined with group id, company domian, env domain', async () => {
      const group = { id: 1 };
      testEntitySourceController.get.mockResolvedValueOnce(group);

      const res = await groupFetchDataController.getGroupEmail(group.id);
      expect(res).toBe(`${group.id}@${companyReplyDomain}.${envDomain}`);
    });
  });
});
