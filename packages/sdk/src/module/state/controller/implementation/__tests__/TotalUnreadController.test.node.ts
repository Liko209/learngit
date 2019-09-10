/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-31 16:59:41
 * Copyright © RingCentral. All rights reserved.
 */

import {
  GroupBadge,
  GroupStateHandleTask,
  GroupEntityHandleTask,
  ProfileEntityHandleTask,
  INIT_STATUS,
} from '../../../types';
import { Group } from '../../../../group/entity';
import { Profile } from '../../../../profile/entity';
import { GROUP_BADGE_TYPE, TASK_DATA_TYPE } from '../../../constants';
import { GroupState } from '../../../entity';
import { GroupStateDao } from '../../../dao';
import { GroupService } from '../../../../group';
import { TotalUnreadController } from '../TotalUnreadController';
import { DeactivatedDao } from '../../../../../dao';
import { NotificationEntityPayload } from '../../../../../service/notificationCenter';
import { EVENT_TYPES } from '../../../../../service';
import { EntitySourceController } from '../../../../../framework/controller/impl/EntitySourceController';
import { IEntityPersistentController } from '../../../../../framework/controller/interface/IEntityPersistentController';
import { AccountUserConfig } from '../../../../account/config/AccountUserConfig';
import { ServiceLoader, ServiceConfig } from '../../../../serviceLoader';
import { EntityPersistentController } from 'sdk/framework/controller/impl/EntityPersistentController';
import { TestDatabase } from 'sdk/framework/controller/__tests__/TestTypes';

jest.mock('../../../../../module/config');
jest.mock('../../../../group');
jest.mock('../../../../../module/account/config');
jest.mock('../../../dao');

type DataHandleTask =
  | GroupStateHandleTask
  | GroupEntityHandleTask
  | ProfileEntityHandleTask;

describe('TotalUnreadController', () => {
  let totalUnreadController: TotalUnreadController;
  let mockEntitySourceController: EntitySourceController<GroupState>;
  let mockEntityPersistentController: EntityPersistentController<GroupState>;
  const mockGroupService = new GroupService({} as any);
  const mockProfileService = {
    getFavoriteGroupIds: jest.fn(),
  };
  const mockBadgeService = { updateBadge: jest.fn(), registerBadge: jest.fn() };
  beforeEach(() => {
    jest.clearAllMocks();
    mockEntityPersistentController = new EntityPersistentController<GroupState>(
      new GroupStateDao(new TestDatabase()),
    );
    mockEntitySourceController = new EntitySourceController<GroupState>(
      mockEntityPersistentController as IEntityPersistentController<GroupState>,
      {} as DeactivatedDao,
    );
    totalUnreadController = new TotalUnreadController(
      mockGroupService,
      mockEntitySourceController,
    );

    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        if (config === ServiceConfig.PROFILE_SERVICE) {
          return mockProfileService;
        }
        if (config === ServiceConfig.ACCOUNT_SERVICE) {
          return { userConfig: AccountUserConfig.prototype };
        }
        if (config === ServiceConfig.BADGE_SERVICE) {
          return mockBadgeService;
        }
        return;
      });
  });

  it('132123', () => {
    expect(1).toEqual(1);
  });

  describe('reset()', () => {
    it('should reset all unread', () => {
      totalUnreadController['_singleGroupBadges'].set(5683, {
        id: GROUP_BADGE_TYPE.DIRECT_MESSAGE,
        unreadCount: 16,
        mentionCount: 16,
      });
      totalUnreadController['_badgeMap'].set(GROUP_BADGE_TYPE.FAVORITE_DM, {
        id: GROUP_BADGE_TYPE.DIRECT_MESSAGE,
        unreadCount: 16,
        mentionCount: 16,
      });
      totalUnreadController['_badgeMap'].set(GROUP_BADGE_TYPE.FAVORITE_TEAM, {
        id: GROUP_BADGE_TYPE.TEAM,
        unreadCount: 16,
        mentionCount: 16,
      });
      totalUnreadController['_badgeMap'].set(GROUP_BADGE_TYPE.DIRECT_MESSAGE, {
        id: GROUP_BADGE_TYPE.FAVORITE_DM,
        unreadCount: 16,
        mentionCount: 16,
      });
      totalUnreadController['_badgeMap'].set(GROUP_BADGE_TYPE.TEAM, {
        id: GROUP_BADGE_TYPE.FAVORITE_TEAM,
        unreadCount: 16,
        mentionCount: 16,
      });
      totalUnreadController.reset();
      expect(totalUnreadController['_singleGroupBadges'].size).toEqual(0);
      expect(
        totalUnreadController['_badgeMap'].get(GROUP_BADGE_TYPE.FAVORITE_DM),
      ).toEqual({
        id: GROUP_BADGE_TYPE.FAVORITE_DM,
        unreadCount: 0,
        mentionCount: 0,
      });
      expect(
        totalUnreadController['_badgeMap'].get(GROUP_BADGE_TYPE.FAVORITE_TEAM),
      ).toEqual({
        id: GROUP_BADGE_TYPE.FAVORITE_TEAM,
        unreadCount: 0,
        mentionCount: 0,
      });
      expect(
        totalUnreadController['_badgeMap'].get(GROUP_BADGE_TYPE.DIRECT_MESSAGE),
      ).toEqual({
        id: GROUP_BADGE_TYPE.DIRECT_MESSAGE,
        unreadCount: 0,
        mentionCount: 0,
      });
      expect(
        totalUnreadController['_badgeMap'].get(GROUP_BADGE_TYPE.TEAM),
      ).toEqual({
        id: GROUP_BADGE_TYPE.TEAM,
        unreadCount: 0,
        mentionCount: 0,
      });
    });
  });

  describe('getSingleGroupBadge()', () => {
    it('should return correct unread info', () => {
      const id: number = 55668833;
      const unread: GroupBadge = {
        id: GROUP_BADGE_TYPE.DIRECT_MESSAGE,
        unreadCount: 16,
        mentionCount: 16,
      };
      totalUnreadController['_singleGroupBadges'].set(id, unread);
      expect(totalUnreadController.getSingleGroupBadge(id)).toEqual(unread);
    });

    it('should return undefined when the unread info is not in map', () => {
      const id: number = 55668833;
      expect(totalUnreadController.getSingleGroupBadge(id)).toEqual(undefined);
    });
  });

  describe('handleGroupState()', () => {
    it('should start handle task when array only has one task', async () => {
      const payload: GroupState[] = [];
      totalUnreadController['_appendTask'] = jest.fn();
      await totalUnreadController.handleGroupState(payload);
      expect(totalUnreadController['_appendTask']).toHaveBeenCalledWith({
        type: TASK_DATA_TYPE.GROUP_STATE,
        data: payload,
      });
    });
  });

  describe('handleGroup()', () => {
    it('should start handle task when array only has one task', async () => {
      const payload: Group[] = [];
      totalUnreadController['_appendTask'] = jest.fn();
      await totalUnreadController.handleGroup(payload);
      expect(totalUnreadController['_appendTask']).toHaveBeenCalledWith({
        type: TASK_DATA_TYPE.GROUP_ENTITY,
        data: payload,
      });
    });
  });

  describe('handleProfile()', () => {
    it('should start handle task when array only has one task', async () => {
      const payload = {} as NotificationEntityPayload<Profile>;
      totalUnreadController['_appendTask'] = jest.fn();
      await totalUnreadController.handleProfile(payload);
      expect(totalUnreadController['_appendTask']).toHaveBeenCalledWith({
        type: TASK_DATA_TYPE.PROFILE_ENTITY,
        data: payload,
      });
    });
  });

  describe('_appendTask()', () => {
    it('should handle task when queue is empty', async () => {
      const task = { mock: 'task' } as any;
      totalUnreadController['_startDataHandleTask'] = jest.fn();
      await totalUnreadController['_appendTask'](task);
      expect(
        totalUnreadController['_startDataHandleTask'],
      ).toHaveBeenCalledWith(task);
    });
  });

  describe('_startDataHandleTask', () => {
    it('should do nothing when init failed', async () => {
      const task: DataHandleTask = {
        type: TASK_DATA_TYPE.GROUP_STATE,
        data: 'data' as any,
      };
      totalUnreadController[
        'initializeTotalUnread'
      ] = jest.fn().mockReturnValue(false);
      totalUnreadController['_updateTotalUnreadByStateChanges'] = jest.fn();
      totalUnreadController['_updateTotalUnreadByGroupChanges'] = jest.fn();
      totalUnreadController['_updateTotalUnreadByProfileChanges'] = jest.fn();
      totalUnreadController['_updateBadge'] = jest.fn();

      await totalUnreadController['_startDataHandleTask'](task);
      expect(totalUnreadController['_changedBadges'].size).toEqual(0);
      expect(totalUnreadController.initializeTotalUnread).toHaveBeenCalledTimes(
        1,
      );
      expect(
        totalUnreadController['_updateTotalUnreadByStateChanges'],
      ).toHaveBeenCalledTimes(0);
      expect(
        totalUnreadController['_updateTotalUnreadByGroupChanges'],
      ).toHaveBeenCalledTimes(0);
      expect(
        totalUnreadController['_updateTotalUnreadByProfileChanges'],
      ).toHaveBeenCalledTimes(0);
      expect(totalUnreadController['_updateBadge']).toHaveBeenCalledTimes(0);
    });

    it('should handle task and stop the queue', async () => {
      const task: DataHandleTask = {
        type: TASK_DATA_TYPE.GROUP_STATE,
        data: 'data' as any,
      };
      totalUnreadController[
        'initializeTotalUnread'
      ] = jest.fn().mockReturnValue(true);
      totalUnreadController['_updateTotalUnreadByStateChanges'] = jest.fn();
      totalUnreadController['_updateTotalUnreadByGroupChanges'] = jest.fn();
      totalUnreadController['_updateTotalUnreadByProfileChanges'] = jest.fn();
      totalUnreadController['_updateBadge'] = jest.fn();

      await totalUnreadController['_startDataHandleTask'](task);
      expect(totalUnreadController.initializeTotalUnread).toHaveBeenCalledTimes(
        1,
      );
      expect(
        totalUnreadController['_updateTotalUnreadByStateChanges'],
      ).toHaveBeenCalledWith(task.data);
      expect(
        totalUnreadController['_updateTotalUnreadByGroupChanges'],
      ).toHaveBeenCalledTimes(0);
      expect(
        totalUnreadController['_updateTotalUnreadByProfileChanges'],
      ).toHaveBeenCalledTimes(0);
      expect(totalUnreadController['_updateBadge']).toHaveBeenCalledTimes(1);
    });

    it('should continue handle next task when crash', async () => {
      const task = jest.fn();
      const task2 = jest.fn();
      totalUnreadController['_taskArray'] = [task, task2];
      totalUnreadController[
        'initializeTotalUnread'
      ] = jest.fn().mockReturnValue(true);
      // prettier-ignore
      totalUnreadController['_updateTotalUnreadByStateChanges'] = jest.fn().mockImplementation(() => {
        throw Error('error');
      });
      totalUnreadController['_updateTotalUnreadByGroupChanges'] = jest.fn();
      totalUnreadController['_updateTotalUnreadByProfileChanges'] = jest.fn();

      await totalUnreadController['_startDataHandleTask']({
        type: TASK_DATA_TYPE.GROUP_STATE,
        data: 'data' as any,
      });
      expect(task2).toHaveBeenCalled();
      expect(
        totalUnreadController['_updateTotalUnreadByStateChanges'],
      ).toHaveBeenCalledWith('data');
    });
  });

  describe('_updateTotalUnreadByStateChanges()', () => {
    it('should update correctly, JPT-1046, JPT-1047, JPT-1052', async () => {
      totalUnreadController['_modifyTotalUnread'] = jest.fn();
      totalUnreadController['_singleGroupBadges'].set(1, {
        id: GROUP_BADGE_TYPE.DIRECT_MESSAGE,
        unreadCount: 8,
        mentionCount: 2,
      });
      totalUnreadController['_singleGroupBadges'].set(3, {
        id: GROUP_BADGE_TYPE.TEAM,
        unreadCount: 5,
        mentionCount: 2,
      });
      const entityMap = new Map<number, GroupState>();
      entityMap.set(1, { id: 1, unread_count: 17 });
      entityMap.set(2, { id: 2 });
      entityMap.set(3, { id: 3, unread_count: 0 });
      const payload: NotificationEntityPayload<GroupState> = {
        type: EVENT_TYPES.UPDATE,
        body: {
          ids: [1, 2, 3],
          entities: entityMap,
        },
      };
      await totalUnreadController['_updateTotalUnreadByStateChanges'](payload);
      expect(totalUnreadController['_modifyTotalUnread']).toBeCalledTimes(2);
      expect(totalUnreadController['_modifyTotalUnread']).toHaveBeenCalledWith(
        GROUP_BADGE_TYPE.DIRECT_MESSAGE,
        9,
        -2,
      );
      expect(totalUnreadController['_modifyTotalUnread']).toHaveBeenCalledWith(
        GROUP_BADGE_TYPE.TEAM,
        -5,
        -2,
      );
      expect(totalUnreadController['_singleGroupBadges'].get(1)).toEqual({
        id: GROUP_BADGE_TYPE.DIRECT_MESSAGE,
        unreadCount: 17,
        mentionCount: 0,
      });
      expect(totalUnreadController['_singleGroupBadges'].get(3)).toEqual({
        id: GROUP_BADGE_TYPE.TEAM,
        unreadCount: 0,
        mentionCount: 0,
      });
    });

    it('should update correctly when current unread count != 0 and update unread count = 0', async () => {
      totalUnreadController['_modifyTotalUnread'] = jest.fn();
      totalUnreadController['_singleGroupBadges'].set(1, {
        id: GROUP_BADGE_TYPE.TEAM,
        unreadCount: 8,
        mentionCount: 2,
        isTeam: true,
      });
      const entityMap = new Map<number, GroupState>();
      entityMap.set(1, { id: 1, unread_count: 0, unread_mentions_count: 1 });
      entityMap.set(2, { id: 2 });
      const payload: NotificationEntityPayload<GroupState> = {
        type: EVENT_TYPES.UPDATE,
        body: {
          ids: [1, 2],
          entities: entityMap,
        },
      };
      await totalUnreadController['_updateTotalUnreadByStateChanges'](payload);
      expect(totalUnreadController['_modifyTotalUnread']).toBeCalledTimes(1);
      expect(totalUnreadController['_modifyTotalUnread']).toBeCalledWith(
        GROUP_BADGE_TYPE.TEAM,
        -8,
        -2,
      );
      expect(totalUnreadController['_singleGroupBadges'].get(1)).toEqual({
        id: GROUP_BADGE_TYPE.TEAM,
        unreadCount: 0,
        mentionCount: 1,
        isTeam: true,
      });
    });

    it('should update correctly when current unread count = 0 and update unread count != 0', async () => {
      totalUnreadController['_modifyTotalUnread'] = jest.fn();
      totalUnreadController['_singleGroupBadges'].set(1, {
        id: GROUP_BADGE_TYPE.TEAM,
        unreadCount: 0,
        mentionCount: 2,
        isTeam: true,
      });
      const entityMap = new Map<number, GroupState>();
      entityMap.set(1, { id: 1, unread_count: 6 });
      entityMap.set(2, { id: 2 });
      const payload: NotificationEntityPayload<GroupState> = {
        type: EVENT_TYPES.UPDATE,
        body: {
          ids: [1, 2],
          entities: entityMap,
        },
      };
      await totalUnreadController['_updateTotalUnreadByStateChanges'](payload);
      expect(totalUnreadController['_modifyTotalUnread']).toBeCalledTimes(1);
      expect(totalUnreadController['_modifyTotalUnread']).toBeCalledWith(
        GROUP_BADGE_TYPE.TEAM,
        6,
        0,
      );
      expect(totalUnreadController['_singleGroupBadges'].get(1)).toEqual({
        id: GROUP_BADGE_TYPE.TEAM,
        unreadCount: 6,
        mentionCount: 0,
        isTeam: true,
      });
    });

    it('should update correctly when current unread count = 0 and update unread count = 0 and mention count changed', async () => {
      totalUnreadController['_modifyTotalUnread'] = jest.fn();
      totalUnreadController['_singleGroupBadges'].set(1, {
        id: GROUP_BADGE_TYPE.TEAM,
        unreadCount: 0,
        mentionCount: 2,
        isTeam: true,
      });
      const entityMap = new Map<number, GroupState>();
      entityMap.set(1, { id: 1, unread_count: 0, unread_mentions_count: 17 });
      entityMap.set(2, { id: 2 });
      const payload: NotificationEntityPayload<GroupState> = {
        type: EVENT_TYPES.UPDATE,
        body: {
          ids: [1, 2],
          entities: entityMap,
        },
      };
      await totalUnreadController['_updateTotalUnreadByStateChanges'](payload);
      expect(totalUnreadController['_modifyTotalUnread']).toBeCalledTimes(1);
      expect(totalUnreadController['_modifyTotalUnread']).toBeCalledWith(
        GROUP_BADGE_TYPE.TEAM,
        0,
        0,
      );
      expect(totalUnreadController['_singleGroupBadges'].get(1)).toEqual({
        id: GROUP_BADGE_TYPE.TEAM,
        unreadCount: 0,
        mentionCount: 17,
        isTeam: true,
      });
    });
  });

  describe('_updateTotalUnreadByGroupChanges()', () => {
    beforeEach(() => {});

    it('should update correctly when update groups, JPT-1045, JPT-1048, JPT-1049, JPT-1052', async () => {
      AccountUserConfig.prototype.getGlipUserId = jest
        .fn()
        .mockReturnValue(5683);
      totalUnreadController['_modifyTotalUnread'] = jest.fn();
      totalUnreadController['_addNewGroupUnread'] = jest.fn();
      totalUnreadController['_singleGroupBadges'].set(1, {
        id: GROUP_BADGE_TYPE.DIRECT_MESSAGE,
        unreadCount: 8,
        mentionCount: 2,
      });
      totalUnreadController['_singleGroupBadges'].set(2, {
        id: GROUP_BADGE_TYPE.TEAM,
        unreadCount: 1,
        mentionCount: 0,
      });
      totalUnreadController['_singleGroupBadges'].set(4, {
        id: GROUP_BADGE_TYPE.FAVORITE_TEAM,
        unreadCount: 2,
        mentionCount: 0,
      });
      mockGroupService.isValid = jest
        .fn()
        .mockImplementation((group: Group) => {
          return (
            group && !group.is_archived && !group.deactivated && !!group.members
          );
        });
      mockEntitySourceController.batchGet = jest
        .fn()
        .mockReturnValueOnce([{ id: 3, unreadCount: 1 }]);
      const groups = [
        {
          id: 1,
          deactivated: true,
          members: [5683],
        } as Group,
        {
          id: 2,
          deactivated: false,
          is_archived: false,
          members: [112233],
        } as Group,
        {
          id: 3,
          deactivated: false,
          members: [5683],
        } as Group,
        {
          id: 4,
          deactivated: false,
          is_archived: true,
          members: [5683],
        } as Group,
      ];
      await totalUnreadController['_updateTotalUnreadByGroupChanges'](groups);
      expect(AccountUserConfig.prototype.getGlipUserId).toHaveBeenCalledTimes(
        1,
      );
      expect(totalUnreadController['_modifyTotalUnread']).toHaveBeenCalledTimes(
        3,
      );
      expect(totalUnreadController['_modifyTotalUnread']).toHaveBeenCalledWith(
        GROUP_BADGE_TYPE.DIRECT_MESSAGE,
        -8,
        -2,
      );
      expect(totalUnreadController['_modifyTotalUnread']).toHaveBeenCalledWith(
        GROUP_BADGE_TYPE.TEAM,
        -1,
        -0,
      );
      expect(totalUnreadController['_modifyTotalUnread']).toHaveBeenCalledWith(
        GROUP_BADGE_TYPE.FAVORITE_TEAM,
        -2,
        -0,
      );
      expect(totalUnreadController['_addNewGroupUnread']).toHaveBeenCalledTimes(
        1,
      );
      expect(totalUnreadController['_addNewGroupUnread']).toHaveBeenCalledWith(
        {
          id: 3,
          deactivated: false,
          members: [5683],
        },
        {
          id: 3,
          unreadCount: 1,
        },
      );
      expect(totalUnreadController['_singleGroupBadges'].size).toEqual(0);
    });
  });

  describe('_updateTotalUnreadByProfileChanges()', () => {
    it('should update correctly', async () => {
      totalUnreadController['_updateTotalUnreadByFavoriteChanges'] = jest.fn();
      totalUnreadController['_favoriteGroupIds'] = [123, 789];
      const entityMap = new Map<number, Profile>();
      entityMap.set(1, { favorite_group_ids: [123, 456] } as Profile);
      const payload: NotificationEntityPayload<Profile> = {
        type: EVENT_TYPES.UPDATE,
        body: {
          ids: [1, 2],
          entities: entityMap,
        },
      };
      await totalUnreadController['_updateTotalUnreadByProfileChanges'](
        payload,
      );
      expect(
        totalUnreadController['_updateTotalUnreadByFavoriteChanges'],
      ).toHaveBeenCalledTimes(2);
      expect(
        totalUnreadController['_updateTotalUnreadByFavoriteChanges'],
      ).toHaveBeenCalledWith([456], true);
      expect(
        totalUnreadController['_updateTotalUnreadByFavoriteChanges'],
      ).toHaveBeenCalledWith([789], false);
    });

    it('should update correctly when profile is invalid', async () => {
      totalUnreadController['_updateTotalUnreadByFavoriteChanges'] = jest.fn();
      totalUnreadController['_favoriteGroupIds'] = [123, 789];
      const entityMap = new Map<number, Profile>();
      entityMap.set(1, {} as Profile);
      const payload: NotificationEntityPayload<Profile> = {
        type: EVENT_TYPES.UPDATE,
        body: {
          ids: [1, 2],
          entities: entityMap,
        },
      };
      await totalUnreadController['_updateTotalUnreadByProfileChanges'](
        payload,
      );
      expect(
        totalUnreadController['_updateTotalUnreadByFavoriteChanges'],
      ).toHaveBeenCalledTimes(2);
      expect(
        totalUnreadController['_updateTotalUnreadByFavoriteChanges'],
      ).toHaveBeenCalledWith([], true);
      expect(
        totalUnreadController['_updateTotalUnreadByFavoriteChanges'],
      ).toHaveBeenCalledWith([123, 789], false);
    });
  });

  describe('_updateTotalUnreadByFavoriteChanges()', () => {
    beforeEach(() => {
      totalUnreadController['_modifyTotalUnread'] = jest.fn();
    });

    it('should do nothing when group unread is not in map or is already added to favorite', () => {
      totalUnreadController['_singleGroupBadges'].set(1, {
        id: GROUP_BADGE_TYPE.FAVORITE_TEAM,
        unreadCount: 2,
        mentionCount: 1,
        isTeam: true,
      });
      totalUnreadController['_updateTotalUnreadByFavoriteChanges'](
        [1, 2],
        true,
      );
      expect(totalUnreadController['_modifyTotalUnread']).toHaveBeenCalledTimes(
        0,
      );
      expect(totalUnreadController['_singleGroupBadges'].get(1)).toEqual({
        id: GROUP_BADGE_TYPE.FAVORITE_TEAM,
        unreadCount: 2,
        mentionCount: 1,
        isTeam: true,
      });
    });

    it('should do nothing when group is already removed from favorite', () => {
      totalUnreadController['_singleGroupBadges'].set(1, {
        id: GROUP_BADGE_TYPE.DIRECT_MESSAGE,
        unreadCount: 2,
        mentionCount: 1,
        isTeam: false,
      });
      totalUnreadController['_updateTotalUnreadByFavoriteChanges']([1], false);
      expect(totalUnreadController['_modifyTotalUnread']).toHaveBeenCalledTimes(
        0,
      );
      expect(totalUnreadController['_singleGroupBadges'].get(1)).toEqual({
        id: GROUP_BADGE_TYPE.DIRECT_MESSAGE,
        unreadCount: 2,
        mentionCount: 1,
        isTeam: false,
      });
    });

    it('should update correctly when adding group to favorite', () => {
      totalUnreadController['_singleGroupBadges'].set(1, {
        id: GROUP_BADGE_TYPE.DIRECT_MESSAGE,
        unreadCount: 7,
        mentionCount: 3,
      });
      totalUnreadController['_updateTotalUnreadByFavoriteChanges']([1], true);
      expect(totalUnreadController['_modifyTotalUnread']).toHaveBeenCalledTimes(
        2,
      );
      expect(totalUnreadController['_modifyTotalUnread']).toHaveBeenCalledWith(
        GROUP_BADGE_TYPE.DIRECT_MESSAGE,
        -7,
        -3,
      );
      expect(totalUnreadController['_modifyTotalUnread']).toHaveBeenCalledWith(
        GROUP_BADGE_TYPE.FAVORITE_DM,
        7,
        3,
      );
      expect(totalUnreadController['_singleGroupBadges'].get(1)).toEqual({
        id: GROUP_BADGE_TYPE.FAVORITE_DM,
        unreadCount: 7,
        mentionCount: 3,
      });
    });

    it('should update correctly when removing group from favorite', () => {
      totalUnreadController['_singleGroupBadges'].set(1, {
        id: GROUP_BADGE_TYPE.FAVORITE_DM,
        unreadCount: 9,
        mentionCount: 6,
        isTeam: true,
      });
      totalUnreadController['_updateTotalUnreadByFavoriteChanges']([1], false);
      expect(totalUnreadController['_modifyTotalUnread']).toHaveBeenCalledTimes(
        2,
      );
      expect(totalUnreadController['_modifyTotalUnread']).toHaveBeenCalledWith(
        GROUP_BADGE_TYPE.FAVORITE_DM,
        -9,
        -6,
      );
      expect(totalUnreadController['_modifyTotalUnread']).toHaveBeenCalledWith(
        GROUP_BADGE_TYPE.TEAM,
        9,
        6,
      );
      expect(totalUnreadController['_singleGroupBadges'].get(1)).toEqual({
        id: GROUP_BADGE_TYPE.TEAM,
        unreadCount: 9,
        mentionCount: 6,
        isTeam: true,
      });
    });
  });

  describe('initializeTotalUnread()', () => {
    it('should do nothing when _initStatus is idle', async () => {
      totalUnreadController['_initStatus'] = INIT_STATUS.INITIALIZED;
      totalUnreadController.reset = jest.fn();

      expect(await totalUnreadController.initializeTotalUnread()).toBeTruthy();
      expect(totalUnreadController.reset).not.toHaveBeenCalled();
      expect(totalUnreadController['_initQueue'].length).toEqual(0);
    });

    it('should add promise to queue when _initStatus is initializing', async () => {
      totalUnreadController['_initStatus'] = INIT_STATUS.INITIALIZING;
      totalUnreadController.reset = jest.fn();

      totalUnreadController.initializeTotalUnread();
      expect(totalUnreadController.reset).not.toHaveBeenCalled();
      expect(totalUnreadController['_initQueue'].length).toEqual(1);
    });

    it('should initialize correctly when profile is invalid', async () => {
      totalUnreadController.reset = jest.fn();
      totalUnreadController['_addNewGroupUnread'] = jest.fn();
      totalUnreadController['_registerBadge'] = jest.fn();

      AccountUserConfig.prototype.getGlipUserId = jest
        .fn()
        .mockReturnValue(5683);
      mockGroupService.getEntities = jest
        .fn()
        .mockReturnValue([
          { id: 1, members: [0] },
          { id: 2, members: [1, 5683] },
          { id: 3, members: [123, 5683] },
        ]);
      mockGroupService.isValid = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      mockProfileService.getFavoriteGroupIds.mockReturnValue(undefined);
      mockEntitySourceController.batchGet = jest
        .fn()
        .mockReturnValue([{ id: 2 }]);

      await totalUnreadController.initializeTotalUnread();
      expect(totalUnreadController.reset).toHaveBeenCalledTimes(1);
      expect(mockProfileService.getFavoriteGroupIds).toHaveBeenCalledTimes(1);
      expect(mockGroupService.getEntities).toHaveBeenCalledTimes(1);
      expect(mockGroupService.isValid).toHaveBeenCalledTimes(3);
      expect(AccountUserConfig.prototype.getGlipUserId).toHaveBeenCalledTimes(
        1,
      );
      expect(totalUnreadController['_addNewGroupUnread']).toHaveBeenCalledTimes(
        1,
      );
      expect(totalUnreadController['_addNewGroupUnread']).toHaveBeenCalledWith(
        {
          id: 2,
          members: [1, 5683],
        },
        { id: 2 },
      );
      expect(totalUnreadController['_initStatus']).toEqual(
        INIT_STATUS.INITIALIZED,
      );
      expect(totalUnreadController['_favoriteGroupIds']).toEqual([]);
      expect(totalUnreadController['_registerBadge']).toHaveBeenCalledTimes(1);
    });

    it('should initialize correctly', async () => {
      totalUnreadController.reset = jest.fn();
      totalUnreadController['_addNewGroupUnread'] = jest.fn();
      totalUnreadController['_registerBadge'] = jest.fn();

      AccountUserConfig.prototype.getGlipUserId = jest
        .fn()
        .mockReturnValue(5683);
      mockGroupService.getEntities = jest
        .fn()
        .mockReturnValue([
          { id: 1, members: [0] },
          { id: 2, members: [1, 5683] },
          { id: 3, members: [123, 5683] },
        ]);
      mockGroupService.isValid = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      mockProfileService.getFavoriteGroupIds.mockReturnValue([123, 456]);
      mockEntitySourceController.batchGet = jest
        .fn()
        .mockReturnValueOnce([{ id: 2 }]);
      await totalUnreadController.initializeTotalUnread();
      expect(totalUnreadController.reset).toHaveBeenCalledTimes(1);
      expect(mockProfileService.getFavoriteGroupIds).toHaveBeenCalledTimes(1);
      expect(mockGroupService.getEntities).toHaveBeenCalledTimes(1);
      expect(mockGroupService.isValid).toHaveBeenCalledTimes(3);
      expect(AccountUserConfig.prototype.getGlipUserId).toHaveBeenCalledTimes(
        1,
      );
      expect(totalUnreadController['_addNewGroupUnread']).toHaveBeenCalledTimes(
        1,
      );
      expect(totalUnreadController['_addNewGroupUnread']).toHaveBeenCalledWith(
        {
          id: 2,
          members: [1, 5683],
        },
        {
          id: 2,
        },
      );
      expect(totalUnreadController['_initStatus']).toEqual(
        INIT_STATUS.INITIALIZED,
      );
      expect(totalUnreadController['_favoriteGroupIds']).toEqual([123, 456]);
      expect(totalUnreadController['_registerBadge']).toHaveBeenCalledTimes(1);
    });
  });

  describe('_addNewGroupUnread()', () => {
    it('should add new group unread to favorite id when group is favorite', async () => {
      const groupId: number = 55668833;
      const group = { id: groupId, is_team: true } as Group;
      const groupState: GroupState = {
        id: groupId,
        unread_count: 15,
        unread_mentions_count: 6,
      };
      totalUnreadController['_favoriteGroupIds'] = [55668833];
      totalUnreadController['_modifyTotalUnread'] = jest.fn();
      await totalUnreadController['_addNewGroupUnread'](group, groupState);
      expect(totalUnreadController['_modifyTotalUnread']).toHaveBeenCalledWith(
        GROUP_BADGE_TYPE.FAVORITE_TEAM,
        15,
        6,
      );
      expect(totalUnreadController['_singleGroupBadges'].get(groupId)).toEqual({
        id: GROUP_BADGE_TYPE.FAVORITE_TEAM,
        unreadCount: 15,
        mentionCount: 6,
        isTeam: true,
      });
    });

    it('should add new group unread to team id when team is not favorite', async () => {
      const groupId: number = 55668833;
      const group = { id: groupId, is_team: true } as Group;
      const groupState: GroupState = {
        id: groupId,
        unread_count: 15,
      };
      totalUnreadController['_favoriteGroupIds'] = [11223344];
      totalUnreadController['_modifyTotalUnread'] = jest.fn();
      await totalUnreadController['_addNewGroupUnread'](group, groupState);
      expect(totalUnreadController['_modifyTotalUnread']).toHaveBeenCalledWith(
        GROUP_BADGE_TYPE.TEAM,
        15,
        0,
      );
      expect(totalUnreadController['_singleGroupBadges'].get(groupId)).toEqual({
        id: GROUP_BADGE_TYPE.TEAM,
        unreadCount: 15,
        mentionCount: 0,
        isTeam: true,
      });
    });

    it('should not modify totalUnread when group state is null', async () => {
      const groupId: number = 55668833;
      const group = { id: groupId } as Group;
      totalUnreadController['_favoriteGroupIds'] = [11223344];
      totalUnreadController['_modifyTotalUnread'] = jest.fn();
      await totalUnreadController['_addNewGroupUnread'](group, { id: 3 });
      expect(
        totalUnreadController['_modifyTotalUnread'],
      ).not.toHaveBeenCalled();
      expect(totalUnreadController['_singleGroupBadges'].get(groupId)).toEqual({
        id: GROUP_BADGE_TYPE.DIRECT_MESSAGE,
        unreadCount: 0,
        mentionCount: 0,
        isTeam: undefined,
      });
    });
  });

  describe('_modifyTotalUnread()', () => {
    it('should update correct', () => {
      const id = GROUP_BADGE_TYPE.FAVORITE_DM;
      const unreadUpdate = 15;
      const mentionUpdate = -2;
      totalUnreadController['_modifyTotalUnread'](
        id,
        unreadUpdate,
        mentionUpdate,
      );
      expect(
        totalUnreadController['_badgeMap'].get(GROUP_BADGE_TYPE.FAVORITE_DM),
      ).toEqual({
        id: GROUP_BADGE_TYPE.FAVORITE_DM,
        unreadCount: unreadUpdate,
        mentionCount: mentionUpdate,
      });
    });
  });

  describe('_updateBadge()', () => {
    it('should _updateBadge when _changedBadges has data', () => {
      totalUnreadController['_changedBadges'].add(
        GROUP_BADGE_TYPE.DIRECT_MESSAGE,
      );
      const mockData = 'mockData';
      totalUnreadController['_getBadge'] = jest.fn().mockReturnValue(mockData);

      totalUnreadController['_updateBadge']();
      expect(mockBadgeService.updateBadge).toHaveBeenCalledWith(mockData);
    });

    it('should do noting when _changedBadges does not have data', () => {
      totalUnreadController['_changedBadges'].clear();
      totalUnreadController['_updateBadge']();
      expect(mockBadgeService.updateBadge).not.toHaveBeenCalled();
    });
  });

  describe('_getBadge()', () => {
    it('should return correct value when _badgeMap has valid data', () => {
      const mockData = {
        id: GROUP_BADGE_TYPE.TEAM,
        unreadCount: 11,
        mentionCount: 1,
      };
      totalUnreadController['_badgeMap'].set(GROUP_BADGE_TYPE.TEAM, mockData);
      expect(totalUnreadController['_getBadge'](GROUP_BADGE_TYPE.TEAM)).toEqual(
        { id: GROUP_BADGE_TYPE.TEAM, unreadCount: 11, mentionCount: 1 },
      );
    });

    it('should do noting when _badgeMap does not have valid data', () => {
      totalUnreadController['_badgeMap'].clear();
      expect(
        totalUnreadController['_getBadge'](GROUP_BADGE_TYPE.FAVORITE_TEAM),
      ).toEqual({ id: GROUP_BADGE_TYPE.FAVORITE_TEAM, unreadCount: 0 });
    });
  });

  describe('_registerBadge()', () => {
    it('should register badge', () => {
      totalUnreadController['_getBadge'] = jest.fn();
      mockBadgeService.registerBadge.mockImplementation(
        (id: string, func: () => any) => {
          func();
        },
      );

      totalUnreadController['_registerBadge']();
      expect(mockBadgeService.registerBadge).toHaveBeenCalledTimes(4);
    });
  });

  describe('getMentionUnread() [JPT-81]', () => {
    it('should include mention, team_mention', () => {
      const result = totalUnreadController['_getMentionUnread']({
        unread_mentions_count: 1,
        unread_team_mentions_count: 3,
      } as GroupState);
      expect(result).toEqual(4);
    });
  });
});
