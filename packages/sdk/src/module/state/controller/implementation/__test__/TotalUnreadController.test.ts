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
import { UMI_SECTION_TYPE, TASK_DATA_TYPE } from '../../../constants';
import { GroupState } from '../../../entity';
import { TotalUnreadController } from '../TotalUnreadController';
import { DeactivatedDao } from '../../../../../dao';
import { NotificationEntityPayload } from '../../../../../service/notificationCenter';
import { notificationCenter, SERVICE } from '../../../../../service';
import { EntitySourceController } from '../../../../../framework/controller/impl/EntitySourceController';
import { IEntityPersistentController } from '../../../../../framework/controller/interface/IEntityPersistentController';

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
        section: UMI_SECTION_TYPE.ALL,
        unreadCount: 16,
        mentionCount: 16,
      });
      totalUnreadController['_totalUnread'] = {
        section: UMI_SECTION_TYPE.FAVORITE,
        unreadCount: 16,
        mentionCount: 16,
      };
      totalUnreadController['_favoriteUnread'] = {
        section: UMI_SECTION_TYPE.ALL,
        unreadCount: 16,
        mentionCount: 16,
      };
      totalUnreadController['_directMessageUnread'] = {
        section: UMI_SECTION_TYPE.ALL,
        unreadCount: 16,
        mentionCount: 16,
      };
      totalUnreadController['_teamUnread'] = {
        section: UMI_SECTION_TYPE.ALL,
        unreadCount: 16,
        mentionCount: 16,
      };
      totalUnreadController.reset();
      expect(totalUnreadController['_groupSectionUnread'].size).toEqual(0);
      expect(totalUnreadController['_totalUnread']).toEqual({
        section: UMI_SECTION_TYPE.ALL,
        unreadCount: 0,
        mentionCount: 0,
      });
      expect(totalUnreadController['_favoriteUnread']).toEqual({
        section: UMI_SECTION_TYPE.FAVORITE,
        unreadCount: 0,
        mentionCount: 0,
      });
      expect(totalUnreadController['_directMessageUnread']).toEqual({
        section: UMI_SECTION_TYPE.DIRECT_MESSAGE,
        unreadCount: 0,
        mentionCount: 0,
      });
      expect(totalUnreadController['_teamUnread']).toEqual({
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
        type: TASK_DATA_TYPE.GROUP_STATE,
        data: groupState,
      });
    });

    it('should only add task to array when array has more than one task', async () => {
      const groupState: GroupState[] = [{ id: 123 }];
      totalUnreadController['_taskArray'] = [
        { type: TASK_DATA_TYPE.GROUP_STATE, data: groupState },
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
        type: TASK_DATA_TYPE.GROUP_ENTITY,
        data: payload,
      });
    });

    it('should only add task to array when array has more than one task', async () => {
      const payload = {} as NotificationEntityPayload<Group>;
      totalUnreadController['_taskArray'] = [
        { type: TASK_DATA_TYPE.GROUP_ENTITY, data: payload },
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
        type: TASK_DATA_TYPE.PROFILE_ENTITY,
        data: payload,
      });
    });

    it('should only add task to array when array has more than one task', async () => {
      const payload = {} as NotificationEntityPayload<Profile>;
      totalUnreadController['_taskArray'] = [
        { type: TASK_DATA_TYPE.PROFILE_ENTITY, data: payload },
      ];
      totalUnreadController['_startDataHandleTask'] = jest.fn();
      await totalUnreadController.handleProfile(payload);
      expect(totalUnreadController['_startDataHandleTask']).toBeCalledTimes(0);
    });
  });

  describe('_startDataHandleTask', () => {
    it('should init and stop the queue when _unreadInitialized === false', async () => {
      const task: DataHandleTask = {
        type: TASK_DATA_TYPE.GROUP_STATE,
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
        type: TASK_DATA_TYPE.GROUP_STATE,
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

  describe('_updateTotalUnreadByStateChanges()', () => {});
  describe('_updateTotalUnreadByGroupChanges()', () => {});
  describe('_updateTotalUnreadByProfileChanges()', () => {});
  describe('_updateTotalUnreadByFavoriteChanges()', () => {});
  describe('_initializeTotalUnread()', () => {});
  describe('_addNewGroupUnread()', () => {
    it('should', async () => {
      const groupId: number = 55668833;
      const isTeam: boolean = true;
      const group = { id: groupId, is_team: isTeam } as Group;
      const groupState: GroupState = {
        id: groupId,
        unread_count: 15,
        unread_mentions_count: 6,
      };
      totalUnreadController['_favoriteGroupIds'] = [55668833];
      totalUnreadController['_updateTotalUnread'] = jest.fn();
      mockEntitySourceController.get = jest.fn().mockReturnValue(groupState);
      await totalUnreadController['_addNewGroupUnread'](group);
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
      expect(totalUnreadController['_favoriteUnread']).toEqual({
        section: UMI_SECTION_TYPE.FAVORITE,
        unreadCount: mentionUpdate,
        mentionCount: mentionUpdate,
      });
      expect(totalUnreadController['_totalUnread']).toEqual({
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
      expect(totalUnreadController['_favoriteUnread']).toEqual({
        section: UMI_SECTION_TYPE.FAVORITE,
        unreadCount: unreadUpdate,
        mentionCount: mentionUpdate,
      });
      expect(totalUnreadController['_totalUnread']).toEqual({
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
      expect(notificationCenter.emit).toBeCalledWith(SERVICE.TOTAL_UNREAD, [
        totalUnreadController['_totalUnread'],
        totalUnreadController['_favoriteUnread'],
        totalUnreadController['_directMessageUnread'],
        totalUnreadController['_teamUnread'],
      ]);
    });
  });
});
