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
import { UserConfig } from '../../../../service/account';
import { ENTITY, SERVICE } from '../../../../service/eventKey';
import notificationCenter from '../../../../service/notificationCenter';
import { ProfileService } from '../../../profile';
import { PersonService } from '../../../person';
import { Post } from '../../../post/entity';
import { Profile } from '../../../profile/entity';
import { StateService } from '../../../state';
import { GroupDao } from '../../dao';
import { Group } from '../../entity';
import { GroupHandleDataController } from '../GroupHandleDataController';

jest.mock('../../../../api');
jest.mock('../../../../framework/controller');

jest.mock('../../../profile');
jest.mock('../../../../service/account');
jest.mock('../../../../service/notificationCenter');
jest.mock('../../../state');
jest.mock('../../../../dao', () => {
  const dao = {
    get: jest.fn().mockReturnValue(1),
    queryGroupsByIds: jest.fn(),
    bulkDelete: jest.fn(),
    bulkPut: jest.fn(),
    doInTransaction: jest.fn(),
    update: jest.fn(),
  };
  return {
    daoManager: {
      getDao: () => dao,
      getKVDao: () => dao,
    },
  };
});

jest.mock('../../../../service/serviceManager', () => {
  const instance = {
    getProfile: jest.fn().mockResolvedValue({ favorite_group_ids: [1, 2] }),
    getPersonsByIds: jest.fn().mockResolvedValue({}),
  };
  return {
    getInstance: () => instance,
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

type GenerateFakeGroupOptions = {
  hasPost: boolean;
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

const stateService: StateService = new StateService();
const personService = new PersonService();
const profileService = new ProfileService();

beforeEach(() => {
  jest.clearAllMocks();
  GroupAPI.requestGroupById.mockResolvedValue(requestGroupByIdResult);
  StateService.getInstance = jest.fn().mockReturnValue(stateService);
  PersonService.getInstance = jest.fn().mockReturnValue(personService);
  ProfileService.getInstance = jest.fn().mockReturnValue(profileService);
});

describe('GroupHandleDataController', () => {
  let groupHandleDataController: GroupHandleDataController;
  beforeEach(() => {
    groupHandleDataController = new GroupHandleDataController();
  });
  describe('handleData()', () => {
    it('passing an empty array', async () => {
      const result = await groupHandleDataController.handleData([]);
      expect(result).toBeUndefined();
    });

    it('passing an array', async () => {
      expect.assertions(7);
      UserConfig.getCurrentUserId.mockReturnValueOnce(1);
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
        { _id: 4, deactivated: false },
        { _id: 5, is_archived: true },
      ]);
      await groupHandleDataController.handleData(groups);
      // expect getTransformData function
      expect(GroupAPI.requestGroupById).toHaveBeenCalledTimes(1);
      // expect operateGroupDao function
      expect(daoManager.getDao(GroupDao).bulkDelete).toHaveBeenCalledTimes(1);
      expect(daoManager.getDao(GroupDao).bulkPut).toHaveBeenCalledTimes(1);
      // expect doNotification function
      expect(notificationCenter.emit).toHaveBeenCalledTimes(1);
      expect(notificationCenter.emitEntityDelete).toHaveBeenCalledTimes(1);
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(1);
      expect(notificationCenter.emitEntityUpdate).toBeCalledWith(ENTITY.GROUP, [
        { id: 2, members: [1, 2], deactivated: false },
        { id: 3, members: [2], deactivated: false }, // members is not include self also should notify update
        { id: 4, deactivated: false },
        { id: 5, is_archived: true },
      ]);
    });
  });

  describe('handlePartialData', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should save directly if find partial in DB', async () => {
      daoManager.getDao(GroupDao).get.mockReturnValueOnce(1);
      const groups: Partial<Raw<Group>>[] = toArrayOf<Partial<Raw<Group>>>([
        {
          _id: 3375110,
          version: 2484043918606336,
          modified_at: 1535014387734,
          post_cursor: 26,
        },
      ]);
      await groupHandleDataController.handlePartialData(groups);
      expect(daoManager.getDao(GroupDao).update).toHaveBeenCalledTimes(1);
      expect(notificationCenter.emit).toHaveBeenCalledTimes(1);

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
      expect(GroupAPI.requestGroupById).toHaveBeenCalledTimes(1);
    });
  });
  describe('handleFavoriteGroupsChanged()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('params', async () => {
      daoManager
        .getDao(GroupDao)
        .queryGroupsByIds.mockResolvedValue([{ id: 1, is_team: true }]);
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
      daoManager
        .getDao(GroupDao)
        .queryGroupsByIds.mockResolvedValueOnce([{ is_team: true }]);
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
      jest.clearAllMocks();
    });

    const post = {
      id: 1,
      modified_at: 100,
      created_at: 100,
      is_team: true,
      group_id: 2,
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
      await groupHandleDataController.handleGroupMostRecentPostChanged({
        type: EVENT_TYPES.UPDATE,
        body: {
          entities: map,
        },
      });
      expect(notificationCenter.emit).toHaveBeenCalledTimes(2);
    });
    it('group has not most_recent_post_created_at should update group recent modified time', async () => {
      daoManager
        .getDao(GroupDao)
        .doInTransaction.mockImplementation(async (fn: Function) => {
          await fn();
        });
      daoManager.getDao(GroupDao).get.mockResolvedValueOnce({
        id: 2,
        members: [],
      });
      await groupHandleDataController.handleGroupMostRecentPostChanged({
        type: EVENT_TYPES.UPDATE,
        body: {
          entities: map,
        },
      });
      expect(notificationCenter.emit).toHaveBeenCalledTimes(2);
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
      await groupHandleDataController.handleGroupMostRecentPostChanged({
        type: EVENT_TYPES.UPDATE,
        body: {
          entities: map,
        },
      });
      expect(notificationCenter.emit).toHaveBeenCalledTimes(2);
    });
    it('should emit NEW_POST_TO_GROUP with correct ids always', async () => {
      const map = new Map();
      map.set(11, {
        id: 11,
        modified_at: 100,
        created_at: 100,
        group_id: 21,
      });
      map.set(12, {
        id: 12,
        modified_at: 200,
        created_at: 200,
        group_id: 21,
      });
      map.set(13, {
        id: 13,
        modified_at: 300,
        created_at: 300,
        group_id: 22,
      });
      daoManager.getDao = jest.fn().mockReturnValue({
        doInTransaction: jest.fn().mockImplementation(async (fn: Function) => {
          await fn();
        }),
        get: jest.fn().mockReturnValue(null),
      });
      groupHandleDataController.handlePartialData = jest.fn();
      await groupHandleDataController.handleGroupMostRecentPostChanged({
        type: EVENT_TYPES.UPDATE,
        body: {
          entities: map,
        },
      });
      expect(groupHandleDataController.handlePartialData).toBeCalledTimes(1);
      expect(groupHandleDataController.handlePartialData).toBeCalledWith([]);
      expect(notificationCenter.emit).toHaveBeenCalledTimes(1);
      expect(notificationCenter.emit).toBeCalledWith(
        SERVICE.POST_SERVICE.NEW_POST_TO_GROUP,
        [21, 22],
      );
    });
  });

  describe('filterGroups()', () => {
    it('should remove extra, when limit < total teams', async () => {
      const LIMIT = 2;
      const TOTAL_GROUPS = 5;

      const groups = generateFakeGroups(TOTAL_GROUPS, {
        creator_id: 99,
        is_team: true,
      });
      UserConfig.getCurrentUserId.mockReturnValue(99);
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
      UserConfig.getCurrentUserId.mockReturnValue(99);
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
      UserConfig.getCurrentUserId.mockReturnValue(99);
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
      UserConfig.getCurrentUserId.mockReturnValue(99);

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
      UserConfig.getCurrentUserId.mockReturnValue(99);
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
      UserConfig.getCurrentUserId.mockReturnValue(99);
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
      UserConfig.getCurrentUserId.mockReturnValue(99);
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
      UserConfig.getCurrentUserId.mockReturnValue(99);
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
      UserConfig.getCurrentUserId.mockReturnValue(99);
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
      UserConfig.getCurrentUserId.mockReturnValue(99);
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
      UserConfig.getCurrentUserId.mockReturnValue(2);
      const filteredGroups = await groupHandleDataController.filterGroups(
        group,
        2,
      );
      const ids = filteredGroups.map(item => item.id);
      expect(ids.indexOf(3) !== -1).toBe(true);
      expect(ids.length).toBe(2);
    });
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
    it('should have 2 posts', () => {
      const posts: Post[] = toArrayOf<Post>([
        { id: 1, group_id: 1, modified_at: 1, created_at: 100 },
        { id: 2, group_id: 1, modified_at: 1, created_at: 101 },

        { id: 3, group_id: 2, modified_at: 1, created_at: 101 },
      ]);

      const groupedPosts = groupHandleDataController.getUniqMostRecentPostsByGroup(
        posts,
      );
      expect(groupedPosts.length).toEqual(2);
      expect(groupedPosts[0].id).toEqual(2);
      expect(groupedPosts[1].id).toEqual(3);
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
});
