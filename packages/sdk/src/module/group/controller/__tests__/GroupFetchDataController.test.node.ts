/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-09 11:18:21
 * Copyright © RingCentral. All rights reserved.
 */

import { ERROR_CODES_NETWORK, JNetworkError } from 'foundation/error';
import { groupFactory } from '../../../../__tests__/factories';
import { Api } from '../../../../api';
import GroupAPI from '../../../../api/glip/group';
import { daoManager } from '../../../../dao';
import { TestEntityCacheSearchController } from '../../../../framework/__mocks__/controller/TestEntityCacheSearchController';
import { TestEntitySourceController } from '../../../../framework/__mocks__/controller/TestEntitySourceController';
import { TestPartialModifyController } from '../../../../framework/__mocks__/controller/TestPartialModifyController';
import { EntityCacheController } from '../../../../framework/controller/impl/EntityCacheController';
import { IEntityCacheSearchController } from '../../../../framework/controller/interface/IEntityCacheSearchController';
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';
import { IPartialModifyController } from '../../../../framework/controller/interface/IPartialModifyController';
import { AccountUserConfig } from '../../../account/config/AccountUserConfig';
import { CompanyService } from 'sdk/module/company';
import { GROUP_QUERY_TYPE } from 'sdk/service/constants';
import { ProfileService } from '../../../profile';
import { PostService } from '../../../post';
import { TypeDictionary, GlipTypeUtil } from 'sdk/utils';
import { PersonService } from '../../../person';
import { Person } from '../../../person/entity';
import { GroupDao } from '../../dao';
import { Group, TeamPermission } from '../../entity';
import { GroupService } from '../../index';
import { GroupFetchDataController } from '../GroupFetchDataController';
import { GroupHandleDataController } from '../GroupHandleDataController';
import { SearchUtils } from '../../../../framework/utils/SearchUtils';
import { GroupEntityCacheController } from '../GroupEntityCacheController';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { GroupConfigService } from '../../../groupConfig';
import { SearchService } from 'sdk/module/search';
import { PermissionService } from 'sdk/module/permission';
import { PresenceService } from 'sdk/module/presence';
import { PRESENCE } from 'sdk/module/presence/constant';
import { SortUtils } from 'sdk/framework/utils';
import { SortableModel } from 'sdk/framework/model';

const soundex = require('soundex-code');

jest.mock('../../../../dao');
jest.mock('../../../groupConfig/dao');
jest.mock('../../../../framework/controller/impl/EntityPersistentController');
jest.mock('../../dao');
jest.mock('../../../profile');
jest.mock('sdk/module/account/config');
jest.mock('../../../../service/notificationCenter');
jest.mock('sdk/module/company');
jest.mock('../../../post');
jest.mock('sdk/api');
jest.mock('sdk/api/glip/group');
jest.mock('../../../groupConfig');
jest.mock('sdk/module/search');

function clearMock() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}
describe('GroupFetchDataController', () => {
  let testEntitySourceController: IEntitySourceController<Group>;
  let groupFetchDataController: GroupFetchDataController;
  let testPartialModifyController: IPartialModifyController<Group>;

  let entityCacheController: EntityCacheController<Group>;
  let testEntityCacheSearchController: IEntityCacheSearchController<Group>;
  let groupService: GroupService;

  const groupDao = new GroupDao(null);
  const postService = new PostService();
  const profileService = new ProfileService();
  const personService = new PersonService();
  const presenceService = new PresenceService();
  const companyService = new CompanyService();
  const groupConfigService = new GroupConfigService();
  const searchService = new SearchService();
  const permissionService = new PermissionService();
  const mockUserId = 1;

  function prepareRecentData(groupIds: number[], time = Date.now()) {
    const groupConfigs = new Map([
      [groupIds[0], { id: groupIds[1], my_last_post_time: time }],
      [groupIds[1], { id: groupIds[2], my_last_post_time: time - 1 }],
      [groupIds[2], { id: groupIds[3], my_last_post_time: time - 2 }],
    ]);
    groupConfigService.getSynchronously = jest
      .fn()
      .mockImplementation((id: number) => {
        return groupConfigs.get(id);
      });

    const records = new Map([
      [groupIds[0], { id: groupIds[1], time_stamp: time + 3 }],
      [groupIds[1], { id: groupIds[2], time_stamp: time + 2 }],
      [groupIds[2], { id: groupIds[3], time_stamp: time - 3 }],
    ]);
    searchService.getRecentSearchRecordsByType = jest
      .fn()
      .mockReturnValue(records);
  }

  function prepareGroupsForSearch() {
    AccountUserConfig.prototype.getGlipUserId = jest
      .fn()
      .mockImplementation(() => 1);

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
    personService._entityCacheController._soundexValue = new Map([
      [11001, person1.display_name.split(' ').map(item => soundex(item))],
      [12001, person2.display_name.split(' ').map(item => soundex(item))],
    ]);

    personService.getSynchronously = jest
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
        members:
          i % 3 === 0 ? [userId, i, i + 1000] : [userId, i, i + 1000, i + 2000],
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
        set_abbreviation: `this is a team name ${i.toString()}`,
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

  function setup() {
    AccountUserConfig.prototype.getGlipUserId = jest
      .fn()
      .mockImplementation(() => mockUserId);
    groupService = new GroupService();

    const serviceMap: Map<string, any> = new Map([
      [ServiceConfig.PERSON_SERVICE, personService as any],
      [ServiceConfig.PRESENCE_SERVICE, presenceService as any],
      [ServiceConfig.PROFILE_SERVICE, profileService as any],
      [ServiceConfig.POST_SERVICE, postService as any],
      [ServiceConfig.COMPANY_SERVICE, companyService as any],
      [ServiceConfig.GROUP_CONFIG_SERVICE, groupConfigService as any],
      [ServiceConfig.SEARCH_SERVICE, searchService as any],
      [ServiceConfig.PERMISSION_SERVICE, permissionService as any],
      [
        ServiceConfig.ACCOUNT_SERVICE,
        { userConfig: AccountUserConfig.prototype } as any,
      ],
    ]);

    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((serviceName: string) => {
        return serviceMap.get(serviceName);
      });
    testEntitySourceController = new TestEntitySourceController<Group>(
      groupFactory,
    );
    testEntitySourceController.get.mockImplementation((id: number) =>
      groupFactory.build({ id }),
    );
    testPartialModifyController = new TestPartialModifyController(
      testEntitySourceController,
    );
    entityCacheController = GroupEntityCacheController.buildGroupEntityCacheController(
      groupService,
    );
    testEntityCacheSearchController = new TestEntityCacheSearchController(
      entityCacheController,
    );

    groupFetchDataController = new GroupFetchDataController(
      groupService,
      testEntitySourceController,
      testPartialModifyController,
      testEntityCacheSearchController,
      new GroupHandleDataController(groupService),
    );
  }
  beforeEach(() => {
    clearMock();
    setup();
  });

  describe('getGroupsByType()', () => {
    it('should can fetch groups via type', async () => {
      const mock = [{ id: 1 }, { id: 2 }];
      testEntitySourceController.getEntities = jest
        .fn()
        .mockResolvedValue(mock);
      const result1 = await groupFetchDataController.getGroupsByType(
        GROUP_QUERY_TYPE.ALL,
        0,
        20,
      );
      expect(result1).toEqual({ data: mock, hasMore: false });

      const result22 = await groupFetchDataController.getGroupsByType(
        GROUP_QUERY_TYPE.FAVORITE,
        0,
        20,
      );
      expect(result22).toEqual({ data: [], hasMore: false });
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
      expect(result3).toEqual({ data: mock, hasMore: false });
    });

    it('should return the correct has more for get groups by type', async () => {
      const mock = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
      testEntitySourceController.getEntities = jest
        .fn()
        .mockResolvedValue(mock);
      groupFetchDataController.groupHandleDataController.filterGroups = jest
        .fn().mockResolvedValue(
        mock,
      );
      const result1 = await groupFetchDataController.getGroupsByType(
        GROUP_QUERY_TYPE.TEAM,
        0,
        2,
        5,
      );
      expect(result1).toEqual({ data: mock, hasMore: true });

      const result22 = await groupFetchDataController.getGroupsByType(
        GROUP_QUERY_TYPE.GROUP,
        0,
        2,
        5,
      );
      expect(result22).toEqual({ data: mock, hasMore: false });
    });

    it('getGroupsByIds()', async () => {
      const mock = [{ id: 1 }];
      testEntitySourceController.batchGet.mockResolvedValue(mock);

      const result1 = await groupFetchDataController.getGroupsByIds([]);
      expect(result1).toEqual([]);

      const result2 = await groupFetchDataController.getGroupsByIds([1]);
      expect(result2).toEqual(mock);
    });

    it('should return favorite list exclude the team which current user not belong to', async () => {
      const curUserId = 3;
      AccountUserConfig.prototype.getGlipUserId.mockReturnValueOnce(curUserId);
      const mock = [{ id: 1, members: [1, 2, 3] }, { id: 2, members: [1, 2] }];
      daoManager.getDao.mockReturnValue(groupDao);

      groupDao.queryAllGroups.mockResolvedValue(mock);
      profileService.getProfile.mockResolvedValueOnce({
        favorite_group_ids: [1, 2],
      });
      groupService.getGroupsByIds = jest.fn().mockReturnValue(mock);
      const result22 = await groupFetchDataController.getGroupsByType(
        GROUP_QUERY_TYPE.FAVORITE,
        0,
        20,
      );
      expect(result22).toEqual({
        data: [{ id: 1, members: [1, 2, 3] }],
        hasMore: false,
      });
    });

    it('should return all groups if left rail max count in LD is -1', async () => {
      const mock: any[] = [];
      for (let i = 0; i < 85; i++) {
        mock.push({ id: 1 });
      }
      const result = { data: mock, hasMore: false };
      jest.spyOn(permissionService, 'getFeatureFlag').mockReturnValueOnce(-1);
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
      expect(result3).toEqual(result);
    });

    // Temp remove, if we need support LD, will re-add it
    // it('should return limit groups if left rail max count is not -1 in LD', async () => {
    //   const mock: any[] = [];
    //   for (let i = 0; i < 85; i++) {
    //     mock.push({ id: 1 });
    //   }
    //   const spy = jest.spyOn(permissionService, 'getFeatureFlag');
    //   spy.mockReturnValueOnce(78);
    //   jest.spyOn(
    //     groupFetchDataController.groupHandleDataController,
    //     'filterGroups',
    //   );
    //   groupFetchDataController.groupHandleDataController.filterGroups.mockResolvedValueOnce(
    //     mock,
    //   );
    //   // GROUP_QUERY_TYPE.GROUP && GROUP_QUERY_TYPE.TEAM
    //   groupDao.queryGroups.mockResolvedValue(mock);
    //   const result3 = await groupFetchDataController.getGroupsByType(
    //     GROUP_QUERY_TYPE.GROUP,
    //     0,
    //     20,
    //   );
    //   expect(spy).toHaveBeenCalled();
    //   expect(result3).toEqual(mock.slice(0, 78));
    // });

    // it('should return all groups if result count < max count in LD', async () => {
    //   const mock: any[] = [];
    //   for (let i = 0; i < 20; i++) {
    //     mock.push({ id: 1 });
    //   }
    //   const result = { data: mock, hasMore: true };
    //   jest.spyOn(permissionService, 'getFeatureFlag').mockReturnValueOnce(89);
    //   jest.spyOn(
    //     groupFetchDataController.groupHandleDataController,
    //     'filterGroups',
    //   );
    //   groupFetchDataController.groupHandleDataController.filterGroups.mockResolvedValueOnce(
    //     mock,
    //   );
    //   // GROUP_QUERY_TYPE.GROUP && GROUP_QUERY_TYPE.TEAM
    //   groupDao.queryGroups.mockResolvedValue(mock);
    //   const result3 = await groupFetchDataController.getGroupsByType(
    //     GROUP_QUERY_TYPE.GROUP,
    //     0,
    //     20,
    //   );
    //   expect(result3).toEqual(result);
    // });
  });

  describe('getLocalGroup()', () => {
    it('should call groupDao with personIds append self id', async () => {
      daoManager.getDao.mockReturnValue(groupDao);
      await groupFetchDataController.getLocalGroup([11, 12]);
      expect(groupDao.queryGroupByMemberList).toHaveBeenCalledWith([
        11,
        12,
        mockUserId,
      ]);
    });
  });

  it('requestRemoteGroupByMemberList()', async () => {
    daoManager.getDao.mockReturnValue(groupDao);
    groupDao.get.mockResolvedValue(1); // userId

    const mockNormal = { _id: 1 };
    GroupAPI.requestNewGroup.mockResolvedValue(mockNormal);
    const result1 = await groupFetchDataController.requestRemoteGroupByMemberList(
      [1, 2],
    );
    expect(result1).toEqual({ id: 1 });

    const mockEmpty = null;
    GroupAPI.requestNewGroup.mockResolvedValue(mockEmpty);
    const result2 = await groupFetchDataController.requestRemoteGroupByMemberList(
      [1, 2],
    );
    expect(result2).toEqual(null);

    const mockError = new JNetworkError(ERROR_CODES_NETWORK.FORBIDDEN, '');
    GroupAPI.requestNewGroup.mockRejectedValue(mockError);
    await expect(
      groupFetchDataController.requestRemoteGroupByMemberList([1, 2]),
    ).rejects.toEqual(mockError);
  });

  it('getGroupByPersonId()', async () => {
    const mock = { id: 2 };
    AccountUserConfig.prototype.getGlipUserId.mockReturnValueOnce(1);

    daoManager.getDao.mockReturnValueOnce(groupDao);
    groupDao.queryGroupByMemberList.mockResolvedValue(mock);
    const result1 = await groupFetchDataController.getGroupByPersonId(2);
    expect(result1).toEqual(mock);
  });

  describe('doFuzzySearch', () => {
    beforeEach(() => {
      entityCacheController.clear();
      prepareGroupsForSearch();
      SearchUtils.isUseSoundex = jest.fn().mockReturnValue(false);
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

    it('do fuzzy search of groups, should ignore case [JPT-2493]', async () => {
      const result = await groupFetchDataController.doFuzzySearchGroups(
        'BeN, tU',
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
    });

    it('do fuzzy search of teams, recent contact should at top', async () => {
      const ids = [12020, 12016, 12018];
      prepareRecentData(ids);
      const result = await groupFetchDataController.doFuzzySearchTeams(
        'this team name',
        true,
        true,
      );
      expect(result!.sortableModels.length).toBe(500);
      expect([
        result!.sortableModels[0].id,
        result!.sortableModels[1].id,
        result!.sortableModels[2].id,
      ]).toEqual(ids);
    });

    it('do fuzzy search of groups, recent contact should at top', async () => {
      const ids = [11493, 11013, 11025];
      prepareRecentData([11493, 11013, 11025]);
      const result = await groupFetchDataController.doFuzzySearchGroups(
        'ben, tu',
        undefined,
        true,
      );

      expect(result!.sortableModels.length).toBe(500);
      expect([
        result!.sortableModels[0].id,
        result!.sortableModels[1].id,
        result!.sortableModels[2].id,
      ]).toEqual(ids);
    });

    it('do fuzzy search of groups, group of less members should sort first', async () => {
      const result = await groupFetchDataController.doFuzzySearchGroups(
        'ben, tu',
      );
      expect(result.sortableModels.length).toBe(500);
      expect(result.sortableModels[0].entity.members.length).toEqual(3);
      expect(result.sortableModels[499].entity.members.length).toEqual(4);
    });
  });
  describe('doFuzzySearchAllGroups', () => {
    beforeEach(() => {
      entityCacheController.clear();
      prepareGroupsForSearch(entityCacheController);
      SearchUtils.isUseSoundex = jest.fn().mockReturnValue(false);
    });

    it('should return empty data when search key is empty and fetch all is false/undefined', async () => {
      const result = await groupFetchDataController.doFuzzySearchAllGroups(
        '',
       { fetchAllIfSearchKeyEmpty: false },
      );
      expect(result).toEqual({ sortableModels: [], terms: [] });
    });

    it('should return all when terms is empty and fetch all is true', async () => {
      const result: any = await groupFetchDataController.doFuzzySearchAllGroups(
        '',
        { fetchAllIfSearchKeyEmpty: true },
      );
      expect(result.sortableModels.length).toEqual(1505);
    });

    it('should return no data when terms match no group name and fetch all is true', async () => {
      const result: any = await groupFetchDataController.doFuzzySearchAllGroups(
        'ppp',
        { fetchAllIfSearchKeyEmpty: true },
      );
      expect(result.sortableModels.length).toEqual(0);
    });

    it('fetch all matched groups and includes not my members ', async () => {
      const result: any = await groupFetchDataController.doFuzzySearchAllGroups(
        'name',
        { fetchAllIfSearchKeyEmpty: false, myGroupsOnly: false },
      );
      expect(result.sortableModels.length).toEqual(505);
    });

    it('fetch all matched groups and includes not my members should ignore case [JPT-2493]', async () => {
      const result: any = await groupFetchDataController.doFuzzySearchAllGroups(
        'naME',
        { fetchAllIfSearchKeyEmpty: false, myGroupsOnly: false },
      );
      expect(result.sortableModels.length).toEqual(505);
    });

    it('fetch all matched groups and includes my members ', async () => {
      const result: any = await groupFetchDataController.doFuzzySearchAllGroups(
        'name',
        { fetchAllIfSearchKeyEmpty: false, myGroupsOnly: true },
      );
      expect(result.sortableModels.length).toEqual(505);
    });

    it('fetch all matched groups and includes my members ', async () => {
      const result: any = await groupFetchDataController.doFuzzySearchAllGroups(
        '1', // all teams has name 1xxxx, all groups has name includes 1
        { fetchAllIfSearchKeyEmpty: false, myGroupsOnly: true },
      );
      expect(result.sortableModels.length).toEqual(1505);
    });

    it('fetch all matched groups and recent should at top ', async () => {
      const ids = [12002, 12006, 13006];
      prepareRecentData(ids);
      const result = await groupFetchDataController.doFuzzySearchAllGroups(
        'name',
        { fetchAllIfSearchKeyEmpty: false, myGroupsOnly: false, recentFirst: true, sortFunc: (groupA: SortableModel<Group>, groupB: SortableModel<Group>) => {
          return SortUtils.compareSortableModel<Group>(groupA, groupB);
        } },
      );
      expect(result.sortableModels.length).toEqual(505);
      const expectedModels = result.sortableModels.slice(0, 4);
      expect(expectedModels.map(x => x.id)).toEqual([...ids, 13002]);
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

    const team5: Group = {
      id: 5,
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
      set_abbreviation: 'Jupiter Engineer - test Jupiter project ',
      email_friendly_abbreviation: '',
      most_recent_content_modified_at: 1,
    };

    function prepareGroupsForSearch() {
      AccountUserConfig.prototype.getGlipUserId = jest
        .fn()
        .mockImplementation(() => 1);

      entityCacheController.put(team1);
      entityCacheController.put(team2);
      entityCacheController.put(team3);
      entityCacheController.put(team4);
      entityCacheController.put(team5);
    }

    beforeEach(() => {
      entityCacheController.clear();
      SearchUtils.isUseSoundex = jest.fn().mockReturnValue(false);
      prepareGroupsForSearch();
    });

    it('should show correct', async () => {
      const result = await groupFetchDataController.doFuzzySearchTeams(
        'Jupiter, E',
      );
      expect(result.sortableModels.length).toBe(5);
      expect(result.sortableModels[0].entity).toEqual(team3);
      expect(result.sortableModels[1].entity).toEqual(team5);
      expect(result.sortableModels[2].entity).toEqual(team4);
      expect(result.sortableModels[3].entity).toEqual(team1);
      expect(result.sortableModels[4].entity).toEqual(team2);
    });
  });

  describe('getOrCreateGroupByMemberList', () => {
    const groupDao = new GroupDao(null);

    beforeEach(() => {
      AccountUserConfig.prototype.getGlipUserId.mockReturnValueOnce(3);
    });

    const mockNormal = { id: 1 };
    const memberIDs = [1, 2];
    const nullGroup: any = null;
    it('group exist in DB already', async () => {
      // group exist in DB already

      daoManager.getDao.mockReturnValue(groupDao);
      groupDao.queryGroupByMemberList.mockResolvedValue(mockNormal);
      const result1 = await groupFetchDataController.getOrCreateGroupByMemberList(
        memberIDs,
      );

      expect(AccountUserConfig.prototype.getGlipUserId).toHaveBeenCalled();
      expect(groupDao.queryGroupByMemberList).toHaveBeenCalledWith([1, 2, 3]);
      expect(result1).toEqual(mockNormal);
    });

    it('group not exist in DB already, request from server', async () => {
      testEntitySourceController.put = jest.fn();
      jest
        .spyOn(groupFetchDataController, 'requestRemoteGroupByMemberList')
        .mockResolvedValueOnce(mockNormal); // first call
      daoManager.getDao.mockReturnValue(groupDao);
      groupDao.queryGroupByMemberList.mockResolvedValue(nullGroup);
      const result2 = await groupFetchDataController.getOrCreateGroupByMemberList(
        memberIDs,
      );
      expect(testEntitySourceController.put).toHaveBeenCalledWith(result2);
      expect(groupDao.queryGroupByMemberList).toHaveBeenCalledWith([1, 2, 3]);
      expect(AccountUserConfig.prototype.getGlipUserId).toHaveBeenCalled();
      expect(result2).toEqual(mockNormal);
    });

    it('throw error ', async () => {
      const error = new JNetworkError(
        ERROR_CODES_NETWORK.INTERNAL_SERVER_ERROR,
        '',
      );
      jest
        .spyOn(groupFetchDataController, 'requestRemoteGroupByMemberList')
        .mockRejectedValueOnce(error);
      daoManager.getDao.mockReturnValue(groupDao);
      groupDao.queryGroupByMemberList.mockResolvedValue(null);
      expect(
        groupFetchDataController.getOrCreateGroupByMemberList(memberIDs),
      ).rejects.toBe(error);
    });
  });

  describe('requestRemoteGroupByMemberList', () => {
    beforeEach(() => {
      const curUserId = 3;
      AccountUserConfig.prototype.getGlipUserId.mockReturnValueOnce(curUserId);
    });
    it('should return a group when request success', async () => {
      const data = { _id: 1 };
      GroupAPI.requestNewGroup.mockResolvedValueOnce(data);
      const result = await groupFetchDataController.requestRemoteGroupByMemberList(
        [1, 2],
      );
      expect(result).toEqual({ id: 1 });
      expect(GroupAPI.requestNewGroup).toHaveBeenCalledWith(
        expect.objectContaining({
          members: [1, 2, 3],
          creator_id: mockUserId,
          is_new: true,
          new_version: expect.any(Number),
        }),
      );
    });

    it('should throw an error when exception happened ', async () => {
      const error = new JNetworkError(
        ERROR_CODES_NETWORK.INTERNAL_SERVER_ERROR,
        'error',
      );
      GroupAPI.requestNewGroup.mockRejectedValueOnce(error);
      await expect(
        groupFetchDataController.requestRemoteGroupByMemberList([1, 2]),
      ).rejects.toEqual(error);
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

      AccountUserConfig.prototype.getGlipUserId.mockReturnValueOnce(curUserId);
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

  describe('isTeamAdmin', () => {
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
    beforeEach(() => {
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

  describe('doFuzzySearch use soundex', () => {
    beforeEach(() => {
      entityCacheController.clear();
      groupService['_entityCacheController'] = entityCacheController;
      prepareGroupsForSearch();
      SearchUtils.isUseSoundex = jest.fn().mockReturnValue(true);
    });

    it('do fuzzy search of groups with multi terms, ', async () => {
      const result = await groupFetchDataController.doFuzzySearchGroups(
        'baaaaen teeeu',
      );
      expect(result.sortableModels.length).toBe(500);
      expect(result.terms.length).toBe(2);
      expect(result.terms[0]).toBe('baaaaen');
      expect(result.terms[1]).toBe('teeeu');
    });

    it('do fuzzy search of groups with single term', async () => {
      const result = await groupFetchDataController.doFuzzySearchGroups(
        'baaaaen',
      );
      expect(result.sortableModels.length).toBe(500);
      expect(result.terms.length).toBe(1);
      expect(result.terms[0]).toBe('baaaaen');
    });
    it('do fuzzy search of groups with searchKey is empty', async () => {
      const result = await groupFetchDataController.doFuzzySearchGroups('');
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(0);
    });
    it('do fuzzy search of teams with multi term', async () => {
      const result = await groupFetchDataController.doFuzzySearchTeams(
        'thiaaas teiiiam name',
      );
      expect(result.sortableModels.length).toBe(500);
      expect(result.terms.length).toBe(3);
      expect(result.terms[0]).toBe('thiaaas');
      expect(result.terms[1]).toBe('teiiiam');
      expect(result.terms[2]).toBe('name');
    });

    it('do fuzzy search of teams with single term', async () => {
      const result = await groupFetchDataController.doFuzzySearchTeams(
        'thiaaas',
      );
      expect(result.sortableModels.length).toBe(500);
      expect(result.terms.length).toBe(1);
      expect(result.terms[0]).toBe('thiaaas');
    });

    it('do fuzzy search of teams with single term, team include me should in front', async () => {
      groupService.getTeamIdsIncludeMe = jest
        .fn()
        .mockReturnValue(new Set([12004, 12006, 12008]));
      const result = await groupFetchDataController.doFuzzySearchTeams(
        'thiaaas',
      );
      expect(result.sortableModels.length).toBe(500);
      const expectedModels = result.sortableModels.slice(0, 4);
      expect(expectedModels.map(x => x.id)).toEqual([
        12004,
        12006,
        12008,
        12002,
      ]);
    });

    it('do fuzzy search of teams with single term, team include me should in front even when multiple terms matched', async () => {
      groupService.getTeamIdsIncludeMe = jest
        .fn()
        .mockReturnValue(new Set([12006, 12008]));
      const result = await groupFetchDataController.doFuzzySearchTeams(
        'i i a n',
      );
      expect(result.sortableModels.length).toBe(500);

      const expectedModels = result.sortableModels.slice(0, 4);
      expect(expectedModels.map(x => x.id)).toEqual([
        12006,
        12008,
        12002,
        12004,
      ]);
    });

    it('do fuzzy search of teams with searchKey is empty', async () => {
      const result = await groupFetchDataController.doFuzzySearchTeams('');
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(0);
    });
  });

  describe('getGroupNameByMultiMembers', () => {
    beforeEach(() => {
      personService.getName = jest.fn().mockImplementation((person: Person) => {
        if (person.id === 1) {
          return '1';
        }
        if (person.id === 2) {
          return '2';
        }
      });
    });
    it('should return name when members are specified', async () => {
      const person1: Person = {
        id: 1,
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
        id: 2,
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

      const res = await groupFetchDataController.getGroupNameByMultiMembers([
        person1,
        person2,
      ]);
      expect(res).toEqual({ groupName: '1, 2', memberNames: ['1', '2'] });
    });

    it('should filter out when members are deactivated', async () => {
      const person1: Person = {
        id: 1,
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
        id: 2,
        created_at: 1,
        modified_at: 1,
        creator_id: 1,
        is_new: false,
        deactivated: true,
        version: 1,
        company_id: 1,
        email: 'ben1.niu1@ringcentral.com',
        me_group_id: 1,
        first_name: 'ben1',
        last_name: 'niu1',
        display_name: 'ben1 niu1',
      };

      const res = await groupFetchDataController.getGroupNameByMultiMembers([
        person1,
        person2,
      ]);
      expect(res).toEqual({ groupName: '1', memberNames: ['1'] });
    });

    it('should filter out when members flag are deactivated', async () => {
      const person1: Person = {
        id: 1,
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
        flags: 2,
      };

      const person2: Person = {
        id: 2,
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

      const res = await groupFetchDataController.getGroupNameByMultiMembers([
        person1,
        person2,
      ]);
      expect(res).toEqual({ groupName: '2', memberNames: ['2'] });
    });
  });

  describe('getGroupName', () => {
    it('should return directly when is a team', () => {
      const spy = jest.spyOn(groupFetchDataController, 'getAllPersonOfGroup');
      const result = groupFetchDataController.getGroupName({ id: 1, set_abbreviation: 'abc', is_team: true} as Group);
      expect(spy).not.toBeCalled();
      expect(result).toBe('abc');
    })

    it('should return Me when is a MeGroup ', () => {
      personService.getSynchronously = jest
      .fn()
      .mockImplementation((id: number) => { return { id }; });
      personService.getFullName = jest.fn().mockImplementation(() => 'me name');
      const result1 = groupFetchDataController.getGroupName({ id: 1, set_abbreviation: 'abc', is_team: false, members: [1]} as Group);
      expect(result1).toBe('me name');

      personService.getSynchronously = jest
      .fn()
      .mockImplementation((id: number) => undefined);
      const result2 = groupFetchDataController.getGroupName({ id: 1, set_abbreviation: 'abc', is_team: false, members: [1]} as Group);
      expect(result2).toBe('');
    });

    it('should return 1:n group when is a 1:n group ', () => {
      personService.getSynchronously = jest
      .fn()
      .mockImplementation((id: number) => { return { id }; });
      personService.getFullName = jest.fn().mockImplementation(() => 'me name');
      const spy = jest.spyOn(groupFetchDataController, 'getAllPersonOfGroup');
      const mockData = { invisiblePersons: [], visiblePersons: [] };
      spy.mockReturnValue(mockData);
      const group = { id: 1, is_team: false, members: [1, 2, 3]} as Group;
      const result1 = groupFetchDataController.getGroupName(group);
      expect(spy).toHaveBeenCalledWith(group.members, 1);
      expect(result1).toBe('');

      const visiblePersons = [{ id: 2 } as Person, { id:3 } as Person];
      const mockData2 = { invisiblePersons: [], visiblePersons };
      spy.mockReturnValue(mockData2);
      const spy2 = jest.spyOn(groupFetchDataController, 'getGroupNameByMultiMembers');
      spy2.mockReturnValue({groupName: 'dora, bruce', memberNames:['dora', 'bruce']});
      const result2 = groupFetchDataController.getGroupName(group);
      expect(spy).toHaveBeenCalledWith(group.members, 1);
      expect(spy2).toHaveBeenCalledWith(visiblePersons);
      expect(result2).toBe('dora, bruce');
    });
  });

  describe('getAllPersonOfGroup', () => {
    let mockIsVisiblePerson = jest.fn();
    beforeEach(() => {
      ServiceLoader.getInstance = jest
        .fn()
        .mockImplementation((serviceName: string) => {
          if (serviceName === ServiceConfig.PERSON_SERVICE) {
            return {
              isVisiblePerson: mockIsVisiblePerson,
              getSynchronously: jest.fn().mockImplementation(id => {
                return id;
              }),
            };
          }
        });
    });
    it('should return all person if no one is invalid', () => {
      mockIsVisiblePerson = jest.fn().mockReturnValue(true);
      const res = groupFetchDataController.getAllPersonOfGroup([1, 2, 3], 1);
      expect(res.visiblePersons.length).toBe(2);
      expect(res.invisiblePersons.length).toBe(0);
    });

    it('should return deactivated person if there is any', () => {
      mockIsVisiblePerson = jest.fn().mockImplementation(person => {
        return person !== 3;
      });
      const res = groupFetchDataController.getAllPersonOfGroup([1, 2, 3, 4], 2);
      expect(res.visiblePersons.length).toBe(2);
      expect(res.invisiblePersons.length).toBe(1);
      expect(res.invisiblePersons[0]).toBe(3);
    });
  });

  describe('getPersonIdsBySelectedItem', () => {
    beforeEach(() => {
      groupFetchDataController.getGroupsByIds = jest.fn();
    });
    it('should return empty array when ids have group id ', async () => {
      const personIds = [1, 2];
      GlipTypeUtil.isExpectedType = jest.fn().mockImplementation(id => {
        return personIds.includes(id);
      });
      groupFetchDataController.getGroupsByIds = jest
        .fn()
        .mockReturnValue([{ members: [1, 2, 3] }, { members: [1, 2, 4] }]);
      const result = await groupFetchDataController.getPersonIdsBySelectedItem([
        ...personIds,
        3,
        4,
      ]);
      expect(groupFetchDataController.getGroupsByIds).toHaveBeenCalled();
      expect(result).toEqual([1, 2, 3, 4]);
    });
    it('should return empty array when ids have id is string ', async () => {
      const personIds = [1, 2, '1'];
      GlipTypeUtil.isExpectedType = jest.fn().mockImplementation(id => {
        return personIds.includes(id);
      });
      const result = await groupFetchDataController.getPersonIdsBySelectedItem(
        personIds,
      );
      expect(groupFetchDataController.getGroupsByIds).not.toHaveBeenCalled();
      expect(result).toEqual(personIds);
    });
    it('should return empty array when ids are all person id ', async () => {
      const personIds = [1, 2];
      GlipTypeUtil.isExpectedType = jest.fn().mockImplementation(id => {
        return personIds.includes(id);
      });
      const result = await groupFetchDataController.getPersonIdsBySelectedItem(
        personIds,
      );
      expect(groupFetchDataController.getGroupsByIds).not.toHaveBeenCalled();
      expect(result).toEqual(personIds);
    });
    it('should return empty array when has permission', async () => {
      permissionService.hasPermission = jest.fn().mockReturnValue(false);
      const result = await groupFetchDataController.getPersonIdsBySelectedItem([
        1,
        2,
      ]);
      expect(result).toEqual([1, 2]);
    });
    it('should return empty array when ids.length is 0', async () => {
      const result = await groupFetchDataController.getPersonIdsBySelectedItem(
        [],
      );
      expect(result).toEqual([]);
    });
  });

  describe('getMemberAndGuestIds', () => {
    it('should return sorted ids when onlineFirst is true, JPT-2686', async () => {
      groupFetchDataController.entitySourceController.getEntityLocally = jest
        .fn()
        .mockResolvedValue({
          members: [123, 234, 345, 456, 567],
          guest_user_company_ids: [333, 444],
        });
      personService.batchGetSynchronously = jest.fn().mockReturnValue([
        {
          id: 123,
          company_id: 666,
          name: 'B',
        },
        {
          id: 234,
          company_id: 666,
          name: 'A',
        },
        {
          id: 345,
          company_id: 444,
          name: 'D',
        },
        {
          id: 456,
          company_id: 333,
          name: 'C',
        },
      ]);
      presenceService.getSynchronously = jest
        .fn()
        .mockImplementation((id: number) => {
          if (id === 123) {
            return { presence: PRESENCE.AVAILABLE };
          }
          return { presence: PRESENCE.NOTREADY };
        });
      personService.getFullName = jest
        .fn()
        .mockImplementation((person: any) => {
          return person.name;
        });

      const result = await groupFetchDataController.getMemberAndGuestIds(
        1235,
        1,
        1,
        true,
      );
      expect(result).toEqual({
        realMemberIds: [123, 234],
        guestIds: [456, 345],
        optionalIds: [567],
      });
    });
  });
});
