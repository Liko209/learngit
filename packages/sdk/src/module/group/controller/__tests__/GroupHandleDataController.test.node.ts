/*
 * @Author: Paynter Chen
 * @Date: 2019-02-02 16:23:46
 * Copyright © RingCentral. All rights reserved.
 */
import { toArrayOf } from '../../../../__tests__/utils';
import GroupAPI from '../../../../api/glip/group';
import { daoManager } from '../../../../dao';
import { Raw } from '../../../../framework/model';
import { EVENT_TYPES } from '../../../../service';
import { ENTITY } from '../../../../service/eventKey';
import notificationCenter from '../../../../service/notificationCenter';
import { ProfileService } from '../../../profile';
import { PersonService } from '../../../person';
import { Post } from '../../../post/entity';
import { Profile } from '../../../profile/entity';
import { GroupDao } from '../../dao';
import { Group } from '../../entity';
import { GroupHandleDataController } from '../GroupHandleDataController';
import { AccountUserConfig } from '../../../account/config/AccountUserConfig';
import { EntitySourceController } from '../../../../framework/controller/impl/EntitySourceController';
import { SYNC_SOURCE } from '../../../sync';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';

jest.mock('sdk/module/groupConfig');
jest.mock('../../../../module/config');
jest.mock('../../../../module/account/config/AccountUserConfig');

jest.mock('../../../../api');
jest.mock('../../../../framework/controller/impl/EntitySourceController');

jest.mock('../../../profile');
jest.mock('../../../../module/account');
jest.mock('../../../../service/notificationCenter');
jest.mock('../../../state');
jest.mock('sdk/framework/service/EntityBaseService');
jest.mock('../../../../dao', () => {
  const dao = {
    getEntityName: jest.fn().mockReturnValue('test'),
    get: jest.fn().mockReturnValue(1),
    bulkDelete: jest.fn(),
    bulkPut: jest.fn(),
    doInTransaction: jest.fn(),
    update: jest.fn(),
  };
  return {
    daoManager: {
      getDao: () => dao,
      getKVDao: () => dao,
      observeDBInitialize: jest.fn(),
    },
  };
});

const requestGroupByIdResult = {
  id: 1,
  members: [1],
  deactivated: true,
  _delta: false,
};

jest.mock('../../../../api/glip/group', () => {
  return {
    requestGroupById: jest.fn(),
  };
});

const groupConfigService = {
  handleMyMostRecentPostChange: jest.fn(),
  getById: jest.fn(),
};

const stateService = {
  getAllGroupStatesFromLocal: jest.fn(),
  handleGroupChangeForTotalUnread: jest.fn(),
};

function generateFakeGroups(
  count: number,
  {
    hasPost = true,
    creator_id = 0,
    members = [],
    is_team = false,
    deactivated = false,
  } = {},
) {
  const groups: Group[] = [];

  for (let i = 1; i <= count; i += 1) {
    const group: Group = {
      is_team,
      members,
      deactivated,
      is_company_team: false,
      id: i,
      created_at: i,
      modified_at: i,
      creator_id: creator_id || i,
      is_new: false,

      version: i,
      company_id: i,
      set_abbreviation: '',
      email_friendly_abbreviation: '',
      most_recent_content_modified_at: i,
    };

    if (hasPost) {
      group.most_recent_post_created_at = i;
    }
    groups.push(group);
  }
  return groups;
}

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('GroupHandleDataController', () => {
  let entitySourceController: EntitySourceController<any>;
  let personService: PersonService;
  let profileService: ProfileService;
  let groupService = {
    getGroupsByIds: jest.fn(),
    isValid: jest.fn(),
  };
  let groupHandleDataController: GroupHandleDataController;

  function setUp() {
    entitySourceController = new EntitySourceController<Group>(
      groupService as any,
      entitySourceController,
    );
    personService = new PersonService();
    profileService = new ProfileService();
    groupService = {
      getGroupsByIds: jest.fn(),
      isValid: jest.fn(),
    };

    GroupAPI.requestGroupById.mockResolvedValue(requestGroupByIdResult);

    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((serviceName: string) => {
        if (serviceName === ServiceConfig.STATE_SERVICE) {
          return stateService;
        }

        if (serviceName === ServiceConfig.PERSON_SERVICE) {
          return personService;
        }
        if (serviceName === ServiceConfig.PROFILE_SERVICE) {
          return profileService;
        }

        if (serviceName === ServiceConfig.ACCOUNT_SERVICE) {
          return { userConfig: AccountUserConfig.prototype };
        }

        if (serviceName === ServiceConfig.GROUP_CONFIG_SERVICE) {
          return groupConfigService;
        }
        return null;
      });

    groupHandleDataController = new GroupHandleDataController(
      groupService as any,
      entitySourceController,
    );

    AccountUserConfig.prototype.getGlipUserId.mockReturnValue(1);
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('handleData()', () => {
    it('should emit notification when passing an array from index', async () => {
      const result = await groupHandleDataController.handleData(
        [],
        SYNC_SOURCE.INDEX,
      );
      expect(result).toBeUndefined();
    });

    it('passing an array', async () => {
      expect.assertions(6);
      AccountUserConfig.prototype.getGlipUserId.mockReturnValueOnce(1);
      daoManager.getDao(GroupDao).get.mockReturnValue(1);
      const groups: Raw<Group>[] = toArrayOf<Raw<Group>>([
        {
          _id: 1,
          members: [1],
          deactivated: true,
          _delta: {
            remove: { members: Array(1) },
            set: {
              modified_at: 1535007198836,
              most_recent_content_modified_at: 1535007198836,
              version: 2916578790211584,
            },
            _id: 4276230,
          },
        },
        { _id: 2, members: [1, 2], deactivated: false },
        { _id: 3, members: [2], deactivated: false },
        { _id: 4, members: [], deactivated: false },
        { _id: 5, members: [], is_archived: true },
      ]);
      await groupHandleDataController.handleData(groups, SYNC_SOURCE.INDEX);
      // expect getTransformData function
      expect(GroupAPI.requestGroupById).toHaveBeenCalledTimes(1);
      // expect operateGroupDao function
      expect(entitySourceController.bulkDelete).toHaveBeenCalledTimes(1);
      expect(entitySourceController.bulkUpdate).toHaveBeenCalledTimes(1);
      // expect doNotification function
      expect(notificationCenter.emit).toHaveBeenCalledTimes(1);
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(1);
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledWith(
        ENTITY.GROUP,
        [
          { id: 2, members: [1, 2], deactivated: false },
          { id: 3, members: [2], deactivated: false }, // members is not include self also should notify update
          { id: 4, members: [], deactivated: false },
          { id: 5, members: [], is_archived: true },
          { _delta: false, deactivated: true, id: 1, members: [1] },
        ],
      );
    });

    it('should not emit notification when passing an array from remaining', async () => {
      expect.assertions(6);
      AccountUserConfig.prototype.getGlipUserId.mockReturnValueOnce(1);
      daoManager.getDao(GroupDao).get.mockReturnValue(1);
      const groups: Raw<Group>[] = toArrayOf<Raw<Group>>([
        {
          _id: 1,
          members: [1],
          deactivated: true,
          _delta: {
            remove: { members: Array(1) },
            set: {
              modified_at: 1535007198836,
              most_recent_content_modified_at: 1535007198836,
              version: 2916578790211584,
            },
            _id: 4276230,
          },
        },
        { _id: 2, members: [1, 2], deactivated: false },
        { _id: 3, members: [2], deactivated: false },
        { _id: 4, members: [], deactivated: false },
        { _id: 5, members: [], is_archived: true },
      ]);
      await groupHandleDataController.handleData(groups, SYNC_SOURCE.REMAINING);
      // expect getTransformData function
      expect(GroupAPI.requestGroupById).toHaveBeenCalledTimes(1);
      // expect operateGroupDao function
      expect(entitySourceController.bulkDelete).toHaveBeenCalledTimes(1);
      expect(entitySourceController.bulkUpdate).toHaveBeenCalledTimes(1);
      // expect doNotification function
      expect(notificationCenter.emit).toHaveBeenCalledTimes(1);
      expect(notificationCenter.emitEntityDelete).not.toHaveBeenCalledTimes(1);
      expect(notificationCenter.emitEntityUpdate).not.toHaveBeenCalledTimes(1);
    });

    it('should not emit notification when passing an array with changeMap', async () => {
      expect.assertions(6);
      AccountUserConfig.prototype.getGlipUserId.mockReturnValueOnce(1);
      daoManager.getDao(GroupDao).get.mockReturnValue(1);
      const groups: Raw<Group>[] = toArrayOf<Raw<Group>>([
        {
          _id: 1,
          members: [1],
          deactivated: true,
          _delta: {
            remove: { members: Array(1) },
            set: {
              modified_at: 1535007198836,
              most_recent_content_modified_at: 1535007198836,
              version: 2916578790211584,
            },
            _id: 4276230,
          },
        },
        { _id: 2, members: [1, 2], deactivated: false },
        { _id: 3, members: [2], deactivated: false },
        { _id: 4, members: [], deactivated: false },
        { _id: 5, members: [], is_archived: true },
      ]);
      await groupHandleDataController.handleData(
        groups,
        SYNC_SOURCE.INDEX,
        new Map(),
      );
      // expect getTransformData function
      expect(GroupAPI.requestGroupById).toHaveBeenCalledTimes(1);
      // expect operateGroupDao function
      expect(entitySourceController.bulkDelete).toHaveBeenCalledTimes(1);
      expect(entitySourceController.bulkUpdate).toHaveBeenCalledTimes(1);
      // expect doNotification function
      expect(notificationCenter.emit).toHaveBeenCalledTimes(0);
      expect(notificationCenter.emitEntityDelete).not.toHaveBeenCalledTimes(1);
      expect(notificationCenter.emitEntityUpdate).not.toHaveBeenCalledTimes(1);
    });
  });

  describe('handlePartialData', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should save directly if find partial in DB', async () => {
      entitySourceController.get.mockReturnValueOnce(1);
      const groups: Partial<Raw<Group>>[] = toArrayOf<Partial<Raw<Group>>>([
        {
          _id: 3375110,
          version: 2484043918606336,
          modified_at: 1535014387734,
          post_cursor: 26,
        },
      ]);
      await groupHandleDataController.handlePartialData(groups);
      expect(entitySourceController.update).toHaveBeenCalledTimes(1);
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(1);

      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(1);
      expect(GroupAPI.requestGroupById).not.toHaveBeenCalled();
    });

    it('should call api if can not find partial in DB', async () => {
      daoManager.getDao(GroupDao).get.mockReturnValueOnce(null);
      const groups: Partial<Raw<Group>>[] = toArrayOf<Partial<Raw<Group>>>([
        {
          _id: 3375110,
          version: 2484043918606336,
          modified_at: 1535014387734,
          post_cursor: 26,
        },
      ]);
      await groupHandleDataController.handlePartialData(groups);
      expect(daoManager.getDao(GroupDao).update).toHaveBeenCalledTimes(0);
      expect(entitySourceController.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleFavoriteGroupsChanged()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('params', async () => {
      groupService.isValid.mockResolvedValue(true);
      groupService.getGroupsByIds.mockResolvedValue([{ id: 1, is_team: true }]);
      const oldProfile: any = {
        person_id: 0,
        favorite_group_ids: [1, 2],
        favorite_post_ids: 0,
      };
      const newProfile: any = {
        person_id: 0,
        favorite_group_ids: [2, 3],
        favorite_post_ids: 0,
      };
      await groupHandleDataController.handleFavoriteGroupsChanged(
        oldProfile as Profile,
        newProfile as Profile,
      );
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(2);
      expect(notificationCenter.emitEntityDelete).toHaveBeenCalledTimes(2);
      expect(notificationCenter.emitEntityReplace).toHaveBeenCalledTimes(1);
      jest.clearAllMocks();
    });
    it('params are arry empty', async () => {
      groupService.getGroupsByIds.mockResolvedValueOnce([{ is_team: true }]);

      const oldProfile: any = {
        person_id: 0,
        favorite_group_ids: [1, 2],
        favorite_post_ids: 0,
      };
      const newProfile: any = {
        person_id: 0,
        favorite_group_ids: [1, 2],
        favorite_post_ids: 0,
      };
      await groupHandleDataController.handleFavoriteGroupsChanged(
        oldProfile,
        newProfile,
      );
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(0);
      expect(notificationCenter.emitEntityDelete).toHaveBeenCalledTimes(0);
    });
  });

  describe('handleGroupMostRecentPostChanged()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    const post = {
      id: 1,
      modified_at: 100,
      created_at: 100,
      is_team: true,
      group_id: 2,
      creator_id: 1,
    };
    const map = new Map();
    map.set(1, post);
    it('EVENT_TYPES is not PUT, do not update', async () => {
      await groupHandleDataController.handleGroupMostRecentPostChanged({
        type: EVENT_TYPES.UPDATE,
        body: {
          entities: map,
        },
      });
      expect(notificationCenter.emit).toHaveBeenCalledTimes(0);
    });
    it('EVENT_TYPES is PUT, do update', async () => {
      daoManager
        .getDao(GroupDao)
        .doInTransaction.mockImplementation(async (fn: Function) => {
          await fn();
        });
      daoManager.getDao(GroupDao).get.mockResolvedValueOnce({
        id: 2,
        most_recent_post_created_at: 99,
        members: [],
      });
      entitySourceController.get.mockResolvedValue({
        id: 2,
        most_recent_post_created_at: 99,
        members: [],
      });
      await groupHandleDataController.handleGroupMostRecentPostChanged({
        type: EVENT_TYPES.UPDATE,
        body: {
          entities: map,
        },
      });
      expect(notificationCenter.emit).toHaveBeenCalledTimes(1);
    });

    it('group has no most_recent_post_created_at should update group recent modified time', async () => {
      daoManager
        .getDao(GroupDao)
        .doInTransaction.mockImplementation(async (fn: Function) => {
          await fn();
        });
      daoManager.getDao(GroupDao).get.mockResolvedValueOnce({
        id: 2,
        members: [],
      });
      entitySourceController.get.mockResolvedValue({
        id: 2,
        members: [],
      });
      await groupHandleDataController.handleGroupMostRecentPostChanged({
        type: EVENT_TYPES.UPDATE,
        body: {
          entities: map,
        },
      });
      expect(
        groupConfigService.handleMyMostRecentPostChange,
      ).toHaveBeenCalledWith([
        {
          created_at: 100,
          group_id: 2,
          id: 1,
          is_team: true,
          modified_at: 100,
          creator_id: 1,
        },
      ]);
      expect(notificationCenter.emit).toHaveBeenCalledTimes(1);
    });

    it('group has most_recent_post_created_at and greater then post created_at should not update group recent modified time', async () => {
      daoManager
        .getDao(GroupDao)
        .doInTransaction.mockImplementation(async (fn: Function) => {
          await fn();
        });
      daoManager.getDao(GroupDao).get.mockResolvedValueOnce({
        id: 2,
        members: [],
        most_recent_post_created_at: 101,
      });
      entitySourceController.get.mockResolvedValueOnce({
        id: 2,
        members: [],
        most_recent_post_created_at: 101,
      });
      await groupHandleDataController.handleGroupMostRecentPostChanged({
        type: EVENT_TYPES.UPDATE,
        body: {
          entities: map,
        },
      });
      expect(notificationCenter.emit).toHaveBeenCalledTimes(0);
    });

    it('should not update most_recent_post_id when post is pre-insert', async () => {
      daoManager
        .getDao(GroupDao)
        .doInTransaction.mockImplementation(async (fn: Function) => {
          await fn();
        });
      const group = {
        id: 2,
        members: [],
        most_recent_post_created_at: 88,
        most_recent_post_id: 10,
      };
      daoManager.getDao(GroupDao).get.mockResolvedValueOnce(group);
      entitySourceController.get.mockResolvedValueOnce(group);
      post['id'] = -1;
      map.clear();

      map.set(-1, post);
      jest
        .spyOn(groupHandleDataController, 'handlePartialData')
        .mockResolvedValueOnce();
      await groupHandleDataController.handleGroupMostRecentPostChanged({
        type: EVENT_TYPES.UPDATE,
        body: {
          entities: map,
        },
      });
      expect(groupHandleDataController.handlePartialData).toHaveBeenCalledWith([
        {
          _id: 2,
          most_recent_content_modified_at: 100,
          most_recent_post_created_at: 100,
        },
      ]);
      expect(notificationCenter.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('filterGroups()', () => {
    const group1 = [
      {
        id: 1,
        creator_id: 2,
        __last_accessed_at: 10,
        most_recent_post_created_at: 9,
        created_at: 8,
      },
      {
        id: 2,
        creator_id: 3,
        __last_accessed_at: 12,
        most_recent_post_created_at: 10,
        created_at: 9,
      },
      {
        id: 3,
        creator_id: 3,
        __last_accessed_at: 11,
        most_recent_post_created_at: 8,
        created_at: 7,
      },
    ] as Group[];

    const group2 = [
      {
        id: 1,
        creator_id: 2,
        most_recent_post_created_at: 9,
        created_at: 8,
      },
      {
        id: 2,
        creator_id: 3,
        most_recent_post_created_at: 10,
        created_at: 9,
      },
      {
        id: 3,
        creator_id: 3,
        most_recent_post_created_at: 15,
        created_at: 7,
      },
    ] as Group[];

    const group3 = [
      {
        id: 1,
        creator_id: 2,
        created_at: 12,
      },
      {
        id: 2,
        creator_id: 3,
        created_at: 9,
      },
      {
        id: 3,
        creator_id: 3,
        created_at: 7,
      },
    ] as Group[];

    const group4 = [
      {
        id: 1,
        creator_id: 2,
        __last_accessed_at: 10,
        most_recent_post_created_at: 18,
        created_at: 8,
      },
      {
        id: 2,
        creator_id: 3,
        __last_accessed_at: 12,
        most_recent_post_created_at: 10,
        created_at: 9,
      },
      {
        id: 3,
        creator_id: 3,
        created_at: 20,
      },
    ] as Group[];

    const group5 = [
      {
        id: 1,
        creator_id: 2,
        __last_accessed_at: 10,
        most_recent_post_created_at: 26,
        created_at: 8,
      },
      {
        id: 2,
        creator_id: 3,
        __last_accessed_at: 23,
        most_recent_post_created_at: 10,
        created_at: 9,
      },
      {
        id: 3,
        creator_id: 3,
        __last_accessed_at: 22,
        most_recent_post_created_at: 21,
        created_at: 20,
      },
    ] as Group[];

    const group6 = [
      {
        id: 1,
        creator_id: 2,
        most_recent_post_created_at: 22,
        created_at: 8,
      },
      {
        id: 2,
        creator_id: 2,
        __last_accessed_at: 23,
        created_at: 9,
      },
      {
        id: 3,
        creator_id: 3,
        __last_accessed_at: 21,
        most_recent_post_created_at: 20,
        created_at: 19,
      },
    ] as Group[];

    const group7 = [
      {
        id: 1,
        creator_id: 2,
        created_at: 28,
      },
      {
        id: 2,
        creator_id: 2,
        __last_accessed_at: 23,
        most_recent_post_created_at: 20,
        created_at: 9,
      },
      {
        id: 3,
        creator_id: 3,
        __last_accessed_at: 21,
        most_recent_post_created_at: 20,
        created_at: 19,
      },
    ] as Group[];

    beforeEach(() => {
      AccountUserConfig.prototype.getGlipUserId = jest.fn().mockReturnValue(99);
    });
    it('should remove extra, when limit < total teams', async () => {
      const LIMIT = 2;
      const TOTAL_GROUPS = 5;

      const groups = generateFakeGroups(TOTAL_GROUPS, {
        creator_id: 99,
        is_team: true,
      });

      const filteredGroups = await groupHandleDataController.filterGroups(
        groups,
        LIMIT,
      );
      expect(filteredGroups.length).toBe(LIMIT);
    });

    it('should return all teams, when limit = total teams', async () => {
      const LIMIT = 5;
      const TOTAL_GROUPS = 5;

      const teams = generateFakeGroups(TOTAL_GROUPS, {
        creator_id: 99,
        is_team: true,
      });
      const filteredGroups = await groupHandleDataController.filterGroups(
        teams,
        LIMIT,
      );
      expect(filteredGroups.length).toBe(TOTAL_GROUPS);
    });

    it('should return all teams, when limit > total teams', async () => {
      const LIMIT = 10;
      const TOTAL_GROUPS = 5;

      const teams = generateFakeGroups(TOTAL_GROUPS, {
        creator_id: 99,
        is_team: true,
      });
      const filteredGroups = await groupHandleDataController.filterGroups(
        teams,
        LIMIT,
      );
      expect(filteredGroups.length).toBe(TOTAL_GROUPS);
    });

    it("should return teams with unread team which unread team's position > limit", async () => {
      const LIMIT = 2;
      const TOTAL_GROUPS = 5;

      const teams = generateFakeGroups(TOTAL_GROUPS, {
        creator_id: 99,
        is_team: true,
      });

      stateService.getAllGroupStatesFromLocal.mockResolvedValueOnce([
        { id: 2, unread_count: 1, is_team: true },
      ]);

      const filteredGroups = await groupHandleDataController.filterGroups(
        teams,
        LIMIT,
      );
      expect(filteredGroups.length).toBe(3);
    });

    it("should return all teams when unread teams' position = limit", async () => {
      const LIMIT = 4;
      const TOTAL_GROUPS = 5;

      const teams = generateFakeGroups(TOTAL_GROUPS, { creator_id: 99 });
      stateService.getAllGroupStatesFromLocal.mockResolvedValueOnce([
        { id: 2, unread_count: 1, is_team: true },
      ]);

      const filteredGroups = await groupHandleDataController.filterGroups(
        teams,
        LIMIT,
      );
      expect(filteredGroups.length).toBe(LIMIT);
    });

    it("should return all teams when unread team's position < limit", async () => {
      const LIMIT = 5;
      const TOTAL_GROUPS = 5;

      const teams = generateFakeGroups(TOTAL_GROUPS, {
        creator_id: 99,
        is_team: true,
      });
      stateService.getAllGroupStatesFromLocal.mockResolvedValueOnce([
        { id: 2, unread_count: 1 },
      ]);

      const filteredGroups = await groupHandleDataController.filterGroups(
        teams,
        LIMIT,
      );
      expect(filteredGroups.length).toBe(LIMIT);
    });

    it('should return teams with unread @mention', async () => {
      const LIMIT = 2;
      const TOTAL_GROUPS = 5;

      const teams = generateFakeGroups(TOTAL_GROUPS, {
        creator_id: 99,
        is_team: true,
      });
      stateService.getAllGroupStatesFromLocal.mockResolvedValueOnce([
        { id: 2, unread_mentions_count: 1 },
        { id: 3, unread_mentions_count: 1 },
      ]);

      const filteredGroups = await groupHandleDataController.filterGroups(
        teams,
        LIMIT,
      );
      expect(filteredGroups.length).toBe(4);
    });

    it('should return teams until oldest unread, when multiple teams have unread', async () => {
      const LIMIT = 2;
      const TOTAL_GROUPS = 5;

      const teams = generateFakeGroups(TOTAL_GROUPS, {
        creator_id: 99,
        is_team: true,
      });
      stateService.getAllGroupStatesFromLocal.mockResolvedValue([
        { id: 4, unread_count: 1 },
        { id: 3, unread_count: 1 },
      ]);

      const filteredGroups = await groupHandleDataController.filterGroups(
        teams,
        LIMIT,
      );
      expect(filteredGroups.length).toBe(3);
    });

    it('should also return teams that have not post', async () => {
      const LIMIT = 2;
      const TOTAL_GROUPS = 5;

      const teams = generateFakeGroups(TOTAL_GROUPS, {
        hasPost: false,
        creator_id: 99,
        is_team: true,
      });
      stateService.getAllGroupStatesFromLocal.mockResolvedValueOnce([]);

      const filteredGroups = await groupHandleDataController.filterGroups(
        teams,
        LIMIT,
      );
      expect(filteredGroups.length).toBe(LIMIT);
    });
    it('should return team which includes me', async () => {
      const LIMIT = 2;
      const TOTAL_GROUPS = 5;

      const teams = generateFakeGroups(TOTAL_GROUPS, {
        hasPost: false,
        members: [99, 10],
        is_team: true,
      });
      stateService.getAllGroupStatesFromLocal.mockResolvedValueOnce([]);

      const filteredGroups = await groupHandleDataController.filterGroups(
        teams,
        LIMIT,
      );
      expect(filteredGroups.length).toBe(LIMIT);
    });

    it('should not return group without post', async () => {
      const LIMIT = 2;
      const TOTAL_GROUPS = 5;

      const teams = generateFakeGroups(TOTAL_GROUPS, {
        hasPost: false,
        is_team: false,
      });
      stateService.getAllGroupStatesFromLocal.mockResolvedValueOnce([]);

      const filteredGroups = await groupHandleDataController.filterGroups(
        teams,
        LIMIT,
      );
      expect(filteredGroups.length).toBe(0);
    });

    it('should return group without post but is created by current user', async () => {
      const LIMIT = 2;
      const TOTAL_GROUPS = 5;

      const group = [
        {
          id: 1,
          creator_id: 2,
          created_at: 9999,
        },
        {
          id: 2,
          creator_id: 3,
          created_at: 10000,
        },
        {
          id: 3,
          creator_id: 3,
          most_recent_post_created_at: 22,
        },
      ] as Group[];
      stateService.getAllGroupStatesFromLocal.mockResolvedValueOnce([]);
      AccountUserConfig.prototype.getGlipUserId = jest.fn().mockReturnValue(2);
      const filteredGroups = await groupHandleDataController.filterGroups(
        group,
        2,
      );
      const ids = filteredGroups.map(item => item.id);
      expect(ids.indexOf(3) !== -1).toBe(true);
      expect(ids.length).toBe(2);
    });

    it.each`
      groups    | limit | result
      ${group1} | ${2}  | ${[group1[1], group1[2]]}
      ${group2} | ${3}  | ${[group2[2], group2[1], group2[0]]}
      ${group2} | ${4}  | ${[group2[2], group2[1], group2[0]]}
      ${group3} | ${1}  | ${[group3[0]]}
      ${group4} | ${4}  | ${[group4[0], group4[1]]}
      ${group5} | ${3}  | ${group5}
      ${group6} | ${6}  | ${[group6[1], group6[0], group6[2]]}
      ${group7} | ${2}  | ${[group7[0], group7[1]]}
    `(
      'should return $result, for filter $groups',
      async ({ groups, limit, result }) => {
        stateService.getAllGroupStatesFromLocal.mockResolvedValueOnce([]);
        AccountUserConfig.prototype.getGlipUserId = jest
          .fn()
          .mockReturnValue(2);
        const filteredGroups = await groupHandleDataController.filterGroups(
          groups,
          limit,
        );
        expect(filteredGroups).toEqual(result);
      },
    );
  });

  describe('isNeedToUpdateMostRecent4Group', () => {
    it('should to update most recent post for a group', () => {
      const posts: Post[] = toArrayOf<Post>([
        { id: 1, group_id: 1, modified_at: 100, created_at: 100 },
      ]);
      const groups: Group[] = toArrayOf<Group>([
        { id: 1, most_recent_post_created_at: 99 },
        { id: 1, most_recent_post_created_at: 100 },
      ]);
      expect(
        groupHandleDataController.isNeedToUpdateMostRecent4Group(
          posts[0],
          groups[0],
        ),
      ).toBeTruthy();
      expect(
        groupHandleDataController.isNeedToUpdateMostRecent4Group(
          posts[0],
          groups[1],
        ),
      ).toBeFalsy();
    });
  });

  describe('getUniqMostRecentPostsByGroup', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should have 2 posts', () => {
      const posts: Post[] = toArrayOf<Post>([
        { id: 1, group_id: 1, modified_at: 1, created_at: 100, creator_id: 1 },
        { id: 2, group_id: 1, modified_at: 1, created_at: 101, creator_id: 2 },

        { id: 3, group_id: 2, modified_at: 1, created_at: 102, creator_id: 1 },
        { id: 4, group_id: 2, modified_at: 1, created_at: 103, creator_id: 1 },
      ]);

      const {
        uniqMyMaxPosts,
        uniqMaxPosts,
      } = groupHandleDataController.getUniqMostRecentPostsByGroup(posts);
      expect(uniqMaxPosts.length).toEqual(2);
      expect(uniqMaxPosts[0].id).toEqual(2);
      expect(uniqMaxPosts[1].id).toEqual(4);

      expect(uniqMyMaxPosts.length).toEqual(2);
      expect(uniqMyMaxPosts[0].id).toEqual(1);
      expect(uniqMyMaxPosts[1].id).toEqual(4);
    });
  });

  describe('extractGroupCursor', () => {
    it('should remove last_author_id and cursors in groups', () => {
      const groups = [
        {
          id: 1,
          post_cursor: 2,
          post_drp_cursor: 3,
          last_author_id: 456,
        },
        {
          id: 2,
          post_cursor: 2,
          post_drp_cursor: 3,
          last_author_id: 789,
        },
      ] as any;
      expect(groupHandleDataController.extractGroupCursor(groups)).toEqual([
        {
          id: 1,
        },
        {
          id: 2,
        },
      ]);
      expect(notificationCenter.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('saveDataAndDoNotification()', () => {
    describe('doNotification()', () => {
      it('should call notificationCenter.emit when group is not empty', async () => {
        const groups = generateFakeGroups(1);
        await groupHandleDataController.saveDataAndDoNotification(groups);
        expect(notificationCenter.emit).toHaveBeenCalledTimes(1);
      });

      it('should not call notificationCenter.emit when group is empty', async () => {
        const groups = [];
        await groupHandleDataController.saveDataAndDoNotification(groups);
        expect(notificationCenter.emit).toHaveBeenCalledTimes(0);
      });
    });

    describe('calculateDeltaData()', () => {
      it('should return correct data when include removes', async () => {
        daoManager.getDao(GroupDao).get.mockReturnValue({
          members: [123, 456, 789],
        });
        const deltaGroup = {
          _id: 122222,
          _delta: {
            remove: {
              members: [456],
            },
          },
        } as Raw<Group>;
        expect(
          await groupHandleDataController.calculateDeltaData(deltaGroup),
        ).toEqual({
          members: [123, 789],
        });
      });
      it('should return correct data when include adds', async () => {
        daoManager.getDao(GroupDao).get.mockReturnValue({
          members: [123, 456, 789],
        });
        const deltaGroup = {
          _id: 122222,
          _delta: {
            add: {
              members: [456, 111222],
            },
          },
        } as Raw<Group>;
        expect(
          await groupHandleDataController.calculateDeltaData(deltaGroup),
        ).toEqual({
          members: [123, 456, 789, 111222],
        });
      });
    });
  });

  describe('getTransformData()', () => {
    it('should return deactivated group when removed_guest_user_ids includes current user', async () => {
      AccountUserConfig.prototype.getGlipUserId.mockReturnValue(123);
      const groups = generateFakeGroups(3, {
        deactivated: false,
      });
      groups[0].members = [123, 456, 789];
      groups[0].removed_guest_user_ids = [123];
      groups[1].members = [123, 456];
      groups[1].removed_guest_user_ids = [123];
      const result = await groupHandleDataController.getTransformData(
        groups as Raw<Group>[],
      );
      expect(result).toEqual([
        {
          company_id: 1,
          created_at: 1,
          creator_id: 1,
          deactivated: true,
          email_friendly_abbreviation: '',
          id: 1,
          is_company_team: false,
          is_new: false,
          is_team: false,
          members: [123, 456, 789],
          modified_at: 1,
          most_recent_content_modified_at: 1,
          most_recent_post_created_at: 1,
          removed_guest_user_ids: [123],
          set_abbreviation: '',
          version: 1,
        },
        {
          company_id: 2,
          created_at: 2,
          creator_id: 2,
          deactivated: true,
          email_friendly_abbreviation: '',
          id: 2,
          is_company_team: false,
          is_new: false,
          is_team: false,
          members: [123, 456],
          modified_at: 2,
          most_recent_content_modified_at: 2,
          most_recent_post_created_at: 2,
          removed_guest_user_ids: [123],
          set_abbreviation: '',
          version: 2,
        },
        {
          company_id: 3,
          created_at: 3,
          creator_id: 3,
          deactivated: false,
          email_friendly_abbreviation: '',
          id: 3,
          is_company_team: false,
          is_new: false,
          is_team: false,
          members: [],
          modified_at: 3,
          most_recent_content_modified_at: 3,
          most_recent_post_created_at: 3,
          set_abbreviation: '',
          version: 3,
        },
      ]);
    });
  });

  describe('handleGroupFetchedPost', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      AccountUserConfig.prototype.getGlipUserId.mockReturnValue(1);
    });
    const incomingPosts = [
      { id: 1, created_at: 5, creator_id: 1, group_id: 9 },
      { id: 2, created_at: 7, creator_id: 1, group_id: 9 },
      { id: 3, created_at: 9, creator_id: 2, group_id: 9 },
    ];

    it('should only update when there are posts newer than my latest post and is mine', async () => {
      groupConfigService.getById = jest
        .fn()
        .mockResolvedValue({ my_last_post_time: 6 });
      await groupHandleDataController.handleGroupFetchedPost(
        9,
        incomingPosts as any,
      );

      expect(
        groupConfigService.handleMyMostRecentPostChange,
      ).toHaveBeenCalledWith([
        { created_at: 7, creator_id: 1, group_id: 9, id: 2 },
      ]);
    });

    it('should not update when post is old than my last post time', async () => {
      groupConfigService.getById = jest
        .fn()
        .mockResolvedValue({ my_last_post_time: Date.now() });
      await groupHandleDataController.handleGroupFetchedPost(
        9,
        incomingPosts as any,
      );

      expect(
        groupConfigService.handleMyMostRecentPostChange,
      ).not.toHaveBeenCalled();
    });

    it('should not update when has no post', async () => {
      groupConfigService.getById = jest
        .fn()
        .mockResolvedValue({ my_last_post_time: Date.now() });
      await groupHandleDataController.handleGroupFetchedPost(9, []);

      expect(
        groupConfigService.handleMyMostRecentPostChange,
      ).not.toHaveBeenCalled();
    });

    it('should not update when no post is mine', async () => {
      AccountUserConfig.prototype.getGlipUserId.mockReturnValue(Date.now());
      groupConfigService.getById = jest
        .fn()
        .mockResolvedValue({ my_last_post_time: 0 });
      await groupHandleDataController.handleGroupFetchedPost(
        9,
        incomingPosts as any,
      );

      expect(
        groupConfigService.handleMyMostRecentPostChange,
      ).not.toHaveBeenCalled();
    });
  });
});
