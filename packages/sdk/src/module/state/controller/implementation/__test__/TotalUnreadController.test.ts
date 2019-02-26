/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-31 16:59:41
 * Copyright © RingCentral. All rights reserved.
 */

import {
  SectionUnread,
  GroupStateHandleTask,
  GroupEntityHandleTask,
  ProfileEntityHandleTask,
} from '../../../types';
import { Group } from '../../../../group/entity';
import { Profile } from '../../../../profile/entity';
import { UMI_SECTION_TYPE, TASK_TYPE } from '../../../constants';
import { GroupState } from '../../../entity';
import { GroupService } from '../../../../group';
import { ProfileService } from '../../../../profile';
import { TotalUnreadController } from '../TotalUnreadController';
import { DeactivatedDao } from '../../../../../dao';
import { NotificationEntityPayload } from '../../../../../service/notificationCenter';
import {
  notificationCenter,
  SERVICE,
  EVENT_TYPES,
} from '../../../../../service';
import { EntitySourceController } from '../../../../../framework/controller/impl/EntitySourceController';
import { IEntityPersistentController } from '../../../../../framework/controller/interface/IEntityPersistentController';
import { UserConfig } from '../../../../../service/account';

type DataHandleTask =
  | GroupStateHandleTask
  | GroupEntityHandleTask
  | ProfileEntityHandleTask;

describe('TotalUnreadController', () => {
  let totalUnreadController: TotalUnreadController;
  let mockEntitySourceController: EntitySourceController;
  beforeEach(() => {
    jest.clearAllMocks();
    mockEntitySourceController = new EntitySourceController<GroupState>(
      {} as IEntityPersistentController,
      {} as DeactivatedDao,
    );
    totalUnreadController = new TotalUnreadController(
      mockEntitySourceController,
    );
  });

  describe('reset()', () => {
    it('should reset all unread', () => {
      totalUnreadController['_groupSectionUnread'].set(5683, {
        section: UMI_SECTION_TYPE.DIRECT_MESSAGE,
        unreadCount: 16,
        mentionCount: 16,
      });
      totalUnreadController['_totalUnreadMap'].set(UMI_SECTION_TYPE.ALL, {
        section: UMI_SECTION_TYPE.FAVORITE,
        unreadCount: 16,
        mentionCount: 16,
      });
      totalUnreadController['_totalUnreadMap'].set(UMI_SECTION_TYPE.FAVORITE, {
        section: UMI_SECTION_TYPE.ALL,
        unreadCount: 16,
        mentionCount: 16,
      });
      totalUnreadController['_totalUnreadMap'].set(
        UMI_SECTION_TYPE.DIRECT_MESSAGE,
        {
          section: UMI_SECTION_TYPE.ALL,
          unreadCount: 16,
          mentionCount: 16,
        },
      );
      totalUnreadController['_totalUnreadMap'].set(UMI_SECTION_TYPE.TEAM, {
        section: UMI_SECTION_TYPE.ALL,
        unreadCount: 16,
        mentionCount: 16,
      });
      totalUnreadController.reset();
      expect(totalUnreadController['_groupSectionUnread'].size).toEqual(0);
      expect(
        totalUnreadController['_totalUnreadMap'].get(UMI_SECTION_TYPE.ALL),
      ).toEqual({
        section: UMI_SECTION_TYPE.ALL,
        unreadCount: 0,
        mentionCount: 0,
      });
      expect(
        totalUnreadController['_totalUnreadMap'].get(UMI_SECTION_TYPE.FAVORITE),
      ).toEqual({
        section: UMI_SECTION_TYPE.FAVORITE,
        unreadCount: 0,
        mentionCount: 0,
      });
      expect(
        totalUnreadController['_totalUnreadMap'].get(
          UMI_SECTION_TYPE.DIRECT_MESSAGE,
        ),
      ).toEqual({
        section: UMI_SECTION_TYPE.DIRECT_MESSAGE,
        unreadCount: 0,
        mentionCount: 0,
      });
      expect(
        totalUnreadController['_totalUnreadMap'].get(UMI_SECTION_TYPE.TEAM),
      ).toEqual({
        section: UMI_SECTION_TYPE.TEAM,
        unreadCount: 0,
        mentionCount: 0,
      });
    });
  });

  describe('getSingleUnreadInfo()', () => {
    it('should return correct unread info', () => {
      const id: number = 55668833;
      const unread: SectionUnread = {
        section: UMI_SECTION_TYPE.ALL,
        unreadCount: 16,
        mentionCount: 16,
      };
      totalUnreadController['_groupSectionUnread'].set(id, unread);
      expect(totalUnreadController.getSingleUnreadInfo(id)).toEqual(unread);
    });

    it('should return undefind when the unread info is not in map', () => {
      const id: number = 55668833;
      expect(totalUnreadController.getSingleUnreadInfo(id)).toEqual(undefined);
    });
  });

  describe('handleGroupState()', () => {
    it('should start handle task when array only has one task', async () => {
      const groupState: GroupState[] = [{ id: 123 }];
      totalUnreadController['_startDataHandleTask'] = jest.fn();
      await totalUnreadController.handleGroupState(groupState);
      expect(totalUnreadController['_startDataHandleTask']).toBeCalledWith({
        type: TASK_TYPE.HANDLE_GROUP_STATE,
        data: groupState,
      });
    });

    it('should only add task to array when array has more than one task', async () => {
      const groupState: GroupState[] = [{ id: 123 }];
      totalUnreadController['_taskArray'] = [
        { type: TASK_TYPE.HANDLE_GROUP_STATE, data: groupState },
      ];
      totalUnreadController['_startDataHandleTask'] = jest.fn();
      await totalUnreadController.handleGroupState(groupState);
      expect(totalUnreadController['_startDataHandleTask']).toBeCalledTimes(0);
    });
  });

  describe('handleGroup()', () => {
    it('should start handle task when array only has one task', async () => {
      const payload = {} as NotificationEntityPayload<Group>;
      totalUnreadController['_startDataHandleTask'] = jest.fn();
      await totalUnreadController.handleGroup(payload);
      expect(totalUnreadController['_startDataHandleTask']).toBeCalledWith({
        type: TASK_TYPE.HANDLE_GROUP_ENTITY,
        data: payload,
      });
    });

    it('should only add task to array when array has more than one task', async () => {
      const payload = {} as NotificationEntityPayload<Group>;
      totalUnreadController['_taskArray'] = [
        { type: TASK_TYPE.HANDLE_GROUP_ENTITY, data: payload },
      ];
      totalUnreadController['_startDataHandleTask'] = jest.fn();
      await totalUnreadController.handleGroup(payload);
      expect(totalUnreadController['_startDataHandleTask']).toBeCalledTimes(0);
    });
  });

  describe('handleProfile()', () => {
    it('should start handle task when array only has one task', async () => {
      const payload = {} as NotificationEntityPayload<Profile>;
      totalUnreadController['_startDataHandleTask'] = jest.fn();
      await totalUnreadController.handleProfile(payload);
      expect(totalUnreadController['_startDataHandleTask']).toBeCalledWith({
        type: TASK_TYPE.HANDLE_PROFILE_ENTITY,
        data: payload,
      });
    });

    it('should only add task to array when array has more than one task', async () => {
      const payload = {} as NotificationEntityPayload<Profile>;
      totalUnreadController['_taskArray'] = [
        { type: TASK_TYPE.HANDLE_PROFILE_ENTITY, data: payload },
      ];
      totalUnreadController['_startDataHandleTask'] = jest.fn();
      await totalUnreadController.handleProfile(payload);
      expect(totalUnreadController['_startDataHandleTask']).toBeCalledTimes(0);
    });
  });

  describe('_startDataHandleTask', () => {
    it('should init and stop the queue when _unreadInitialized === false', async () => {
      const task: DataHandleTask = {
        type: TASK_TYPE.HANDLE_GROUP_STATE,
        data: [],
      };
      totalUnreadController['_unreadInitialized'] = false;
      totalUnreadController['_initializeTotalUnread'] = jest.fn();
      totalUnreadController['_updateTotalUnreadByStateChanges'] = jest.fn();
      totalUnreadController['_updateTotalUnreadByGroupChanges'] = jest.fn();
      totalUnreadController['_updateTotalUnreadByProfileChanges'] = jest.fn();
      totalUnreadController['_doNotification'] = jest.fn();

      await totalUnreadController['_startDataHandleTask'](task);
      expect(totalUnreadController['_initializeTotalUnread']).toBeCalledTimes(
        1,
      );
      expect(
        totalUnreadController['_updateTotalUnreadByStateChanges'],
      ).toBeCalledTimes(0);
      expect(
        totalUnreadController['_updateTotalUnreadByGroupChanges'],
      ).toBeCalledTimes(0);
      expect(
        totalUnreadController['_updateTotalUnreadByProfileChanges'],
      ).toBeCalledTimes(0);
      expect(totalUnreadController['_doNotification']).toBeCalledTimes(1);
    });

    it('should handle task and stop the queue when _unreadInitialized === true', async () => {
      const task: DataHandleTask = {
        type: TASK_TYPE.HANDLE_GROUP_STATE,
        data: [],
      };
      totalUnreadController['_unreadInitialized'] = true;
      totalUnreadController['_initializeTotalUnread'] = jest.fn();
      totalUnreadController['_updateTotalUnreadByStateChanges'] = jest.fn();
      totalUnreadController['_updateTotalUnreadByGroupChanges'] = jest.fn();
      totalUnreadController['_updateTotalUnreadByProfileChanges'] = jest.fn();
      totalUnreadController['_doNotification'] = jest.fn();

      await totalUnreadController['_startDataHandleTask'](task);
      expect(totalUnreadController['_initializeTotalUnread']).toBeCalledTimes(
        0,
      );
      expect(
        totalUnreadController['_updateTotalUnreadByStateChanges'],
      ).toBeCalledWith(task.data);
      expect(
        totalUnreadController['_updateTotalUnreadByGroupChanges'],
      ).toBeCalledTimes(0);
      expect(
        totalUnreadController['_updateTotalUnreadByProfileChanges'],
      ).toBeCalledTimes(0);
      expect(totalUnreadController['_doNotification']).toBeCalledTimes(1);
    });
  });

  describe('_updateTotalUnreadByStateChanges()', () => {
    it('should update correctly', async () => {
      totalUnreadController['_updateTotalUnread'] = jest.fn();
      totalUnreadController['_groupSectionUnread'].set(1, {
        section: UMI_SECTION_TYPE.DIRECT_MESSAGE,
        unreadCount: 8,
        mentionCount: 2,
      });
      const groupStates = [
        { id: 1, unread_count: 17, unread_mentions_count: 1 },
        { id: 2 },
      ] as GroupState[];
      await totalUnreadController['_updateTotalUnreadByStateChanges'](
        groupStates,
      );
      expect(totalUnreadController['_updateTotalUnread']).toBeCalledTimes(1);
      expect(totalUnreadController['_updateTotalUnread']).toBeCalledWith(
        UMI_SECTION_TYPE.DIRECT_MESSAGE,
        9,
        -1,
        false,
      );
      expect(totalUnreadController['_groupSectionUnread'].get(1)).toEqual({
        section: UMI_SECTION_TYPE.DIRECT_MESSAGE,
        unreadCount: 17,
        mentionCount: 1,
      });
    });
  });

  describe('_updateTotalUnreadByGroupChanges()', () => {
    it('should update correctly when delete groups', async () => {
      UserConfig.getCurrentUserId = jest.fn();
      totalUnreadController['_updateTotalUnread'] = jest.fn();
      totalUnreadController['_addNewGroupUnread'] = jest.fn();
      totalUnreadController['_groupSectionUnread'].set(1, {
        section: UMI_SECTION_TYPE.DIRECT_MESSAGE,
        unreadCount: 8,
        mentionCount: 2,
      });
      const payload: NotificationEntityPayload<Group> = {
        type: EVENT_TYPES.DELETE,
        body: {
          ids: [1, 2],
        },
      };
      await totalUnreadController['_updateTotalUnreadByGroupChanges'](payload);
      expect(UserConfig.getCurrentUserId).toBeCalledTimes(0);
      expect(totalUnreadController['_addNewGroupUnread']).toBeCalledTimes(0);
      expect(totalUnreadController['_updateTotalUnread']).toBeCalledTimes(1);
      expect(totalUnreadController['_updateTotalUnread']).toBeCalledWith(
        UMI_SECTION_TYPE.DIRECT_MESSAGE,
        -8,
        -2,
        false,
      );
      expect(totalUnreadController['_groupSectionUnread'].size).toEqual(0);
    });

    it('should update correctly when update groups', async () => {
      UserConfig.getCurrentUserId = jest.fn().mockReturnValue(5683);
      totalUnreadController['_updateTotalUnread'] = jest.fn();
      totalUnreadController['_addNewGroupUnread'] = jest.fn();
      totalUnreadController['_groupSectionUnread'].set(1, {
        section: UMI_SECTION_TYPE.DIRECT_MESSAGE,
        unreadCount: 8,
        mentionCount: 2,
      });
      const entityMap = new Map<number, Group>();
      entityMap.set(1, {
        deactivated: true,
        members: [5683],
      } as Group);
      entityMap.set(2, {
        deactivated: false,
        is_archived: false,
        members: [112233],
      } as Group);
      entityMap.set(3, {
        deactivated: false,
        members: [5683],
      } as Group);
      const payload: NotificationEntityPayload<Group> = {
        type: EVENT_TYPES.UPDATE,
        body: {
          ids: [11223344, 1, 2, 3],
          entities: entityMap,
        },
      };
      await totalUnreadController['_updateTotalUnreadByGroupChanges'](payload);
      expect(UserConfig.getCurrentUserId).toBeCalledTimes(1);
      expect(totalUnreadController['_updateTotalUnread']).toBeCalledTimes(1);
      expect(totalUnreadController['_updateTotalUnread']).toBeCalledWith(
        UMI_SECTION_TYPE.DIRECT_MESSAGE,
        -8,
        -2,
        false,
      );
      expect(totalUnreadController['_addNewGroupUnread']).toBeCalledTimes(1);
      expect(totalUnreadController['_addNewGroupUnread']).toBeCalledWith({
        deactivated: false,
        members: [5683],
      });
      expect(totalUnreadController['_groupSectionUnread'].size).toEqual(0);
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
      ).toBeCalledTimes(2);
      expect(
        totalUnreadController['_updateTotalUnreadByFavoriteChanges'],
      ).toHaveBeenCalledWith([456], true);
      expect(
        totalUnreadController['_updateTotalUnreadByFavoriteChanges'],
      ).toHaveBeenCalledWith([789], false);
    });
  });

  describe('_updateTotalUnreadByFavoriteChanges()', () => {
    beforeEach(() => {
      totalUnreadController['_updateTotalUnread'] = jest.fn();
    });

    it('should do nothing when group unread is not in map or is already added to favorite', () => {
      totalUnreadController['_groupSectionUnread'].set(1, {
        section: UMI_SECTION_TYPE.FAVORITE,
        unreadCount: 2,
        mentionCount: 1,
        isTeam: true,
      });
      totalUnreadController['_updateTotalUnreadByFavoriteChanges'](
        [1, 2],
        true,
      );
      expect(totalUnreadController['_updateTotalUnread']).toBeCalledTimes(0);
      expect(totalUnreadController['_groupSectionUnread'].get(1)).toEqual({
        section: UMI_SECTION_TYPE.FAVORITE,
        unreadCount: 2,
        mentionCount: 1,
        isTeam: true,
      });
    });

    it('should do nothing when group is already removed from favorite', () => {
      totalUnreadController['_groupSectionUnread'].set(1, {
        section: UMI_SECTION_TYPE.DIRECT_MESSAGE,
        unreadCount: 2,
        mentionCount: 1,
        isTeam: false,
      });
      totalUnreadController['_updateTotalUnreadByFavoriteChanges']([1], false);
      expect(totalUnreadController['_updateTotalUnread']).toBeCalledTimes(0);
      expect(totalUnreadController['_groupSectionUnread'].get(1)).toEqual({
        section: UMI_SECTION_TYPE.DIRECT_MESSAGE,
        unreadCount: 2,
        mentionCount: 1,
        isTeam: false,
      });
    });

    it('should update correctly when adding group to favorite', () => {
      totalUnreadController['_groupSectionUnread'].set(1, {
        section: UMI_SECTION_TYPE.DIRECT_MESSAGE,
        unreadCount: 7,
        mentionCount: 3,
      });
      totalUnreadController['_updateTotalUnreadByFavoriteChanges']([1], true);
      expect(totalUnreadController['_updateTotalUnread']).toBeCalledTimes(2);
      expect(totalUnreadController['_updateTotalUnread']).toHaveBeenCalledWith(
        UMI_SECTION_TYPE.DIRECT_MESSAGE,
        -7,
        -3,
        false,
      );
      expect(totalUnreadController['_updateTotalUnread']).toHaveBeenCalledWith(
        UMI_SECTION_TYPE.FAVORITE,
        7,
        3,
        false,
      );
      expect(totalUnreadController['_groupSectionUnread'].get(1)).toEqual({
        section: UMI_SECTION_TYPE.FAVORITE,
        unreadCount: 7,
        mentionCount: 3,
      });
    });

    it('should update correctly when removing group from favorite', () => {
      totalUnreadController['_groupSectionUnread'].set(1, {
        section: UMI_SECTION_TYPE.FAVORITE,
        unreadCount: 9,
        mentionCount: 6,
        isTeam: true,
      });
      totalUnreadController['_updateTotalUnreadByFavoriteChanges']([1], false);
      expect(totalUnreadController['_updateTotalUnread']).toBeCalledTimes(2);
      expect(totalUnreadController['_updateTotalUnread']).toBeCalledWith(
        UMI_SECTION_TYPE.FAVORITE,
        -9,
        -6,
        true,
      );
      expect(totalUnreadController['_updateTotalUnread']).toBeCalledWith(
        UMI_SECTION_TYPE.TEAM,
        9,
        6,
        true,
      );
      expect(totalUnreadController['_groupSectionUnread'].get(1)).toEqual({
        section: UMI_SECTION_TYPE.TEAM,
        unreadCount: 9,
        mentionCount: 6,
        isTeam: true,
      });
    });
  });

  describe('_initializeTotalUnread()', () => {
    it('should initialize correctly', async () => {
      totalUnreadController.reset = jest.fn();
      totalUnreadController['_addNewGroupUnread'] = jest.fn();
      UserConfig.getCurrentUserId = jest.fn().mockReturnValue(5683);
      GroupService.getInstance = jest.fn().mockReturnValue({
        getEntitySource: jest.fn().mockReturnValue({
          getEntities: jest
            .fn()
            .mockReturnValue([
              { members: [0] },
              { members: [1, 5683] },
              { members: [123, 5683] },
            ]),
        }),
        isValid: jest
          .fn()
          .mockReturnValueOnce(true)
          .mockReturnValueOnce(true)
          .mockReturnValueOnce(false),
      });
      ProfileService.getInstance = jest.fn().mockReturnValue({
        getFavoriteGroupIds: jest.fn().mockReturnValue([123, 456]),
      });
      await totalUnreadController['_initializeTotalUnread']();
      expect(totalUnreadController.reset).toBeCalledTimes(1);
      expect(
        ProfileService.getInstance<ProfileService>().getFavoriteGroupIds,
      ).toBeCalledTimes(1);
      expect(
        GroupService.getInstance<GroupService>().getEntitySource().getEntities,
      ).toBeCalledTimes(1);
      expect(GroupService.getInstance<GroupService>().isValid).toBeCalledTimes(
        3,
      );
      expect(UserConfig.getCurrentUserId).toBeCalledTimes(2);
      expect(totalUnreadController['_addNewGroupUnread']).toBeCalledTimes(1);
      expect(totalUnreadController['_addNewGroupUnread']).toBeCalledWith({
        members: [1, 5683],
      });
      expect(totalUnreadController['_unreadInitialized']).toEqual(true);
      expect(totalUnreadController['_favoriteGroupIds']).toEqual([123, 456]);
    });
  });

  describe('_addNewGroupUnread()', () => {
    it('should add new group unread to favorite section when group is favorite', async () => {
      const groupId: number = 55668833;
      const group = { id: groupId, is_team: true } as Group;
      const groupState: GroupState = {
        id: groupId,
        unread_count: 15,
        unread_mentions_count: 6,
      };
      totalUnreadController['_favoriteGroupIds'] = [55668833];
      totalUnreadController['_updateTotalUnread'] = jest.fn();
      mockEntitySourceController.get = jest.fn().mockReturnValue(groupState);
      await totalUnreadController['_addNewGroupUnread'](group);
      expect(mockEntitySourceController.get).toBeCalledWith(groupId);
      expect(totalUnreadController['_updateTotalUnread']).toBeCalledWith(
        UMI_SECTION_TYPE.FAVORITE,
        15,
        6,
        true,
      );
      expect(totalUnreadController['_groupSectionUnread'].get(groupId)).toEqual(
        {
          section: UMI_SECTION_TYPE.FAVORITE,
          unreadCount: 15,
          mentionCount: 6,
          isTeam: true,
        },
      );
    });

    it('should add new group unread to team section when team is not favorite', async () => {
      const groupId: number = 55668833;
      const group = { id: groupId, is_team: true } as Group;
      const groupState: GroupState = {
        id: groupId,
        unread_count: 15,
      };
      totalUnreadController['_favoriteGroupIds'] = [11223344];
      totalUnreadController['_updateTotalUnread'] = jest.fn();
      mockEntitySourceController.get = jest.fn().mockReturnValue(groupState);
      await totalUnreadController['_addNewGroupUnread'](group);
      expect(mockEntitySourceController.get).toBeCalledWith(groupId);
      expect(totalUnreadController['_updateTotalUnread']).toBeCalledWith(
        UMI_SECTION_TYPE.TEAM,
        15,
        0,
        true,
      );
      expect(totalUnreadController['_groupSectionUnread'].get(groupId)).toEqual(
        {
          section: UMI_SECTION_TYPE.TEAM,
          unreadCount: 15,
          mentionCount: 0,
          isTeam: true,
        },
      );
    });

    it('should set empty unread when group state is null', async () => {
      const groupId: number = 55668833;
      const group = { id: groupId } as Group;
      totalUnreadController['_favoriteGroupIds'] = [11223344];
      totalUnreadController['_updateTotalUnread'] = jest.fn();
      mockEntitySourceController.get = jest.fn().mockReturnValue(null);
      await totalUnreadController['_addNewGroupUnread'](group);
      expect(mockEntitySourceController.get).toBeCalledWith(groupId);
      expect(totalUnreadController['_updateTotalUnread']).toBeCalledWith(
        UMI_SECTION_TYPE.DIRECT_MESSAGE,
        0,
        0,
        false,
      );
      expect(totalUnreadController['_groupSectionUnread'].get(groupId)).toEqual(
        {
          section: UMI_SECTION_TYPE.DIRECT_MESSAGE,
          unreadCount: 0,
          mentionCount: 0,
          isTeam: undefined,
        },
      );
    });
  });

  describe('_updateTotalUnread()', () => {
    it('should update correct when isTeam === true', () => {
      const section = UMI_SECTION_TYPE.FAVORITE;
      const unreadUpdate = 15;
      const mentionUpdate = -2;
      const isTeam = true;
      totalUnreadController['_updateTotalUnread'](
        section,
        unreadUpdate,
        mentionUpdate,
        isTeam,
      );
      expect(
        totalUnreadController['_totalUnreadMap'].get(UMI_SECTION_TYPE.FAVORITE),
      ).toEqual({
        section: UMI_SECTION_TYPE.FAVORITE,
        unreadCount: mentionUpdate,
        mentionCount: mentionUpdate,
      });
      expect(
        totalUnreadController['_totalUnreadMap'].get(UMI_SECTION_TYPE.ALL),
      ).toEqual({
        section: UMI_SECTION_TYPE.ALL,
        unreadCount: mentionUpdate,
        mentionCount: mentionUpdate,
      });
    });

    it('should update correct when isTeam === false', () => {
      const section = UMI_SECTION_TYPE.FAVORITE;
      const unreadUpdate = -5;
      const mentionUpdate = 16;
      const isTeam = false;
      totalUnreadController['_updateTotalUnread'](
        section,
        unreadUpdate,
        mentionUpdate,
        isTeam,
      );
      expect(
        totalUnreadController['_totalUnreadMap'].get(UMI_SECTION_TYPE.FAVORITE),
      ).toEqual({
        section: UMI_SECTION_TYPE.FAVORITE,
        unreadCount: unreadUpdate,
        mentionCount: mentionUpdate,
      });
      expect(
        totalUnreadController['_totalUnreadMap'].get(UMI_SECTION_TYPE.ALL),
      ).toEqual({
        section: UMI_SECTION_TYPE.ALL,
        unreadCount: unreadUpdate,
        mentionCount: mentionUpdate,
      });
    });
  });

  describe('_doNotification()', () => {
    it('should do notification with correct params', () => {
      notificationCenter.emit = jest.fn();
      totalUnreadController['_doNotification']();
      expect(notificationCenter.emit).toBeCalledWith(
        SERVICE.TOTAL_UNREAD,
        totalUnreadController['_totalUnreadMap'],
      );
    });
  });
});
