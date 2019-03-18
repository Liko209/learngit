/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-17 16:08:17
 * Copyright © RingCentral. All rights reserved.
 */

import { Group } from '../../../../group/entity';
import { StateDataHandleController } from '../StateDataHandleController';
import { EntitySourceController } from '../../../../../framework/controller/impl/EntitySourceController';
import { daoManager, DeactivatedDao } from '../../../../../dao';
import { StateFetchDataController } from '../StateFetchDataController';
import { State, GroupState } from '../../../entity';
import { IEntityPersistentController } from '../../../../../framework/controller/interface/IEntityPersistentController';
import { TASK_DATA_TYPE } from '../../../constants';
import { StateHandleTask, GroupCursorHandleTask } from '../../../types';
import { TotalUnreadController } from '../TotalUnreadController';
import { GlobalConfigService } from '../../../../../module/config/service/GlobalConfigService';
import { AccountGlobalConfig } from '../../../../../service/account/config/AccountGlobalConfig';

jest.mock('../../../../../module/config/service/GlobalConfigService');
jest.mock('../../../../../service/account/config/AccountGlobalConfig');
GlobalConfigService.getInstance = jest
  .fn()
  .mockReturnValue(new GlobalConfigService());
jest.mock('../StateFetchDataController');
jest.mock('../../../../../framework/controller/impl/EntitySourceController');

type DataHandleTask = StateHandleTask | GroupCursorHandleTask;

describe('StateDataHandleController', () => {
  let stateDataHandleController: StateDataHandleController;
  let mockEntitySourceController: EntitySourceController;
  let mockStateFetchDataController: StateFetchDataController;
  let mockTotalUnreadController: TotalUnreadController;
  beforeEach(() => {
    jest.clearAllMocks();
    mockEntitySourceController = new EntitySourceController<GroupState>(
      {} as IEntityPersistentController,
      {} as DeactivatedDao,
    );
    mockStateFetchDataController = new StateFetchDataController(
      mockEntitySourceController,
    );
    mockTotalUnreadController = new TotalUnreadController(
      mockEntitySourceController,
    );
    stateDataHandleController = new StateDataHandleController(
      mockEntitySourceController,
      mockStateFetchDataController,
      mockTotalUnreadController,
    );
  });

  describe('handleState()', () => {
    it('should start handle task when array only has one task', async () => {
      const states: Partial<State>[] = [{ id: 123 }];
      stateDataHandleController['_startDataHandleTask'] = jest.fn();
      await stateDataHandleController.handleState(states);
      expect(stateDataHandleController['_startDataHandleTask']).toBeCalledWith({
        type: TASK_DATA_TYPE.STATE,
        data: states,
      });
    });

    it('should only add task to array when array has more than one task', async () => {
      const states: Partial<State>[] = [{ id: 123 }];
      stateDataHandleController['_taskArray'] = [
        { type: TASK_DATA_TYPE.STATE, data: states },
      ];
      stateDataHandleController['_startDataHandleTask'] = jest.fn();
      await stateDataHandleController.handleState(states);
      expect(stateDataHandleController['_startDataHandleTask']).toBeCalledTimes(
        0,
      );
    });
  });

  describe('handleGroupCursor()', () => {
    it('should start handle task when array only has one task', async () => {
      const groups: Partial<Group>[] = [{ id: 123 }];
      stateDataHandleController['_startDataHandleTask'] = jest.fn();
      await stateDataHandleController.handleGroupCursor(groups);
      expect(stateDataHandleController['_startDataHandleTask']).toBeCalledWith({
        type: TASK_DATA_TYPE.GROUP_CURSOR,
        data: groups,
      });
    });

    it('should only add task to array when array has more than one task', async () => {
      const groups: Partial<Group>[] = [{ id: 123 }];
      stateDataHandleController['_taskArray'] = [
        { type: TASK_DATA_TYPE.GROUP_CURSOR, data: groups },
      ];
      stateDataHandleController['_startDataHandleTask'] = jest.fn();
      await stateDataHandleController.handleGroupCursor(groups);
      expect(stateDataHandleController['_startDataHandleTask']).toBeCalledTimes(
        0,
      );
    });
  });

  describe('_startDataHandleTask', () => {
    it('should handle state task and stop the queue', async () => {
      const task: DataHandleTask = { type: TASK_DATA_TYPE.STATE, data: [] };
      stateDataHandleController['_transformStateData'] = jest.fn();
      stateDataHandleController['_transformGroupData'] = jest.fn();
      stateDataHandleController['_generateUpdatedState'] = jest.fn().mockReturnValue({
        groupStates: [],
      });
      stateDataHandleController['_updateEntitiesAndDoNotification'] = jest.fn();
      mockTotalUnreadController.handleGroupState = jest.fn();

      await stateDataHandleController['_startDataHandleTask'](task);
      expect(stateDataHandleController['_transformStateData']).toBeCalledWith(
        task.data,
      );
      expect(stateDataHandleController['_transformGroupData']).toBeCalledTimes(
        0,
      );
      expect(
        stateDataHandleController['_generateUpdatedState'],
      ).toBeCalledTimes(1);
      expect(
        stateDataHandleController['_updateEntitiesAndDoNotification'],
      ).toBeCalledTimes(1);
      expect(mockTotalUnreadController.handleGroupState).toBeCalledTimes(1);
    });

    it('should handle group task and stop the queue', async () => {
      const task: DataHandleTask = {
        type: TASK_DATA_TYPE.GROUP_CURSOR,
        data: [],
      };
      stateDataHandleController['_transformStateData'] = jest.fn();
      stateDataHandleController['_transformGroupData'] = jest.fn();
      stateDataHandleController['_generateUpdatedState'] = jest.fn().mockReturnValue({
        groupStates: [],
      });
      stateDataHandleController['_updateEntitiesAndDoNotification'] = jest.fn();
      mockTotalUnreadController.handleGroupState = jest.fn();

      await stateDataHandleController['_startDataHandleTask'](task);
      expect(stateDataHandleController['_transformStateData']).toBeCalledTimes(
        0,
      );
      expect(stateDataHandleController['_transformGroupData']).toBeCalledWith(
        task.data,
      );
      expect(
        stateDataHandleController['_generateUpdatedState'],
      ).toBeCalledTimes(1);
      expect(
        stateDataHandleController['_updateEntitiesAndDoNotification'],
      ).toBeCalledTimes(1);
      expect(mockTotalUnreadController.handleGroupState).toBeCalledTimes(1);
    });

    it('should handle next task when crashing', async () => {
      const task: DataHandleTask = {
        type: TASK_DATA_TYPE.GROUP_CURSOR,
        data: 'data' as any,
      };
      const task2: DataHandleTask = {
        type: TASK_DATA_TYPE.STATE,
        data: 'data2' as any,
      };
      stateDataHandleController['_taskArray'] = [task, task2];
      stateDataHandleController['_transformStateData'] = jest.fn();
      stateDataHandleController['_transformGroupData'] = jest.fn().mockImplementation(() => {
        throw Error('error');
      });
      stateDataHandleController['_generateUpdatedState'] = jest.fn().mockReturnValue({
        groupStates: [],
      });
      stateDataHandleController['_updateEntitiesAndDoNotification'] = jest.fn();
      mockTotalUnreadController.handleGroupState = jest.fn();

      await stateDataHandleController['_startDataHandleTask'](task);
      expect(stateDataHandleController['_transformStateData']).toBeCalledWith(
        task2.data,
      );
      expect(stateDataHandleController['_transformGroupData']).toBeCalledWith(
        task.data,
      );
      expect(
        stateDataHandleController['_generateUpdatedState'],
      ).toBeCalledTimes(1);
      expect(
        stateDataHandleController['_updateEntitiesAndDoNotification'],
      ).toBeCalledTimes(1);
      expect(mockTotalUnreadController.handleGroupState).toBeCalledTimes(1);
    });
  });

  describe('_transformGroupData()', () => {
    it('should return transformedState', () => {
      const groups = [
        {
          id: 55668833,
          __trigger_ids: [123],
          post_cursor: 456,
          post_drp_cursor: 789,
        },
        {
          id: 11223344,
          __trigger_ids: [5683],
          post_cursor: 654,
          post_drp_cursor: 321,
        },
      ];
      daoManager.getKVDao = jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue(5683),
      });

      AccountGlobalConfig.getCurrentUserId = jest.fn().mockReturnValue(123);

      expect(stateDataHandleController['_transformGroupData'](groups)).toEqual({
        groupStates: [
          {
            group_post_cursor: 456,
            group_post_drp_cursor: 789,
            id: 55668833,
          },
          {
            group_post_cursor: 654,
            group_post_drp_cursor: 321,
            id: 11223344,
          },
        ],
        isSelf: true,
      });
    });
  });
  describe('_transformStateData()', () => {
    it('should return transformedState', () => {
      const states = [
        {
          _id: 5683,
          unread_count: 13,
          'deactivated_post_cursor:55668833': 1,
          'group_missed_calls_count:55668833': 2,
          'group_tasks_count:55668833': 3,
          'last_read_through:55668833': 4,
          'unread_mentions_count:55668833': 5,
          'read_through:55668833': 6,
          'marked_as_unread:55668833': true,
          'post_cursor:55668833': 8,
          'previous_post_cursor:55668833': 9,
          'unread_deactivated_count:55668833': 10,
        },
      ];
      expect(stateDataHandleController['_transformStateData'](states)).toEqual({
        groupStates: [
          {
            deactivated_post_cursor: 1,
            group_missed_calls_count: 2,
            group_tasks_count: 3,
            id: 55668833,
            last_read_through: 4,
            marked_as_unread: true,
            post_cursor: 8,
            previous_post_cursor: 9,
            read_through: 6,
            unread_deactivated_count: 10,
            unread_mentions_count: 5,
          },
        ],
        myState: {
          id: 5683,
        },
      });
    });
  });
  describe('_generateUpdatedState()', () => {
    it('should return updatedState', async () => {
      const transformedState = {
        groupStates: [
          {
            id: 1,
            marked_as_unread: true,
            post_cursor: 18,
            read_through: 7,
            unread_deactivated_count: 1,
            unread_mentions_count: 6,
          },
          {
            id: 2,
            marked_as_unread: true,
            post_cursor: 13,
            read_through: 209,
            unread_deactivated_count: 10,
            unread_mentions_count: 0,
          },
          {
            id: 3,
            marked_as_unread: true,
            post_cursor: 8,
            read_through: 6,
            unread_deactivated_count: 10,
            unread_mentions_count: 5,
          },
        ],
        isSelf: false,
      };

      mockStateFetchDataController.getAllGroupStatesFromLocal = jest
        .fn()
        .mockReturnValue([
          {
            id: 1,
            marked_as_unread: true,
            post_cursor: 18,
            read_through: 7,
            unread_deactivated_count: 1,
            unread_mentions_count: 6,
            group_post_cursor: 15,
            group_post_drp_cursor: 9,
            unread_count: 0,
          },
          {
            id: 2,
            marked_as_unread: true,
            post_cursor: 11,
            read_through: 209,
            unread_deactivated_count: 11,
            unread_mentions_count: 0,
            unread_count: 2,
            group_post_cursor: 15,
            group_post_drp_cursor: 9,
          },
        ]);

      expect(
        await stateDataHandleController['_generateUpdatedState'](
          transformedState,
        ),
      ).toEqual({
        groupStates: [
          {
            id: 1,
            marked_as_unread: true,
            post_cursor: 18,
            read_through: 7,
            unread_deactivated_count: 1,
            unread_mentions_count: 6,
            group_post_cursor: 15,
            group_post_drp_cursor: 9,
            unread_count: 5,
          },
          {
            group_post_cursor: 15,
            group_post_drp_cursor: 9,
            id: 2,
            marked_as_unread: true,
            post_cursor: 13,
            read_through: 209,
            unread_deactivated_count: 10,
            unread_mentions_count: 0,
            unread_count: 1,
          },
          {
            id: 3,
            marked_as_unread: false,
            post_cursor: 8,
            read_through: 6,
            unread_deactivated_count: 10,
            unread_mentions_count: 5,
            unread_count: 0,
          },
        ],
        myState: undefined,
      });
    });

    it('should return groupState with unread count = 0 when isSelf is true', async () => {
      const transformedState = {
        groupStates: [
          {
            id: 1,
            group_post_cursor: 18,
          },
        ],
        isSelf: true,
      };

      mockStateFetchDataController.getAllGroupStatesFromLocal = jest
        .fn()
        .mockReturnValue([
          {
            id: 1,
            marked_as_unread: true,
            group_post_cursor: 17,
            post_cursor: 16,
            read_through: 7,
            unread_deactivated_count: 0,
            unread_mentions_count: 0,
            unread_count: 1,
          },
        ]);

      expect(
        await stateDataHandleController['_generateUpdatedState'](
          transformedState,
        ),
      ).toEqual({
        groupStates: [
          {
            id: 1,
            marked_as_unread: false,
            group_post_cursor: 18,
            post_cursor: 16,
            read_through: 7,
            unread_deactivated_count: 0,
            unread_mentions_count: 0,
            unread_count: 0,
          },
        ],
        myState: undefined,
      });
    });
  });
});
