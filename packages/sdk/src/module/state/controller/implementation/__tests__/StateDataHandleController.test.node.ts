/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-17 16:08:17
 * Copyright © RingCentral. All rights reserved.
 */

import { Group } from '../../../../group/entity';
import { StateDataHandleController } from '../StateDataHandleController';
import { EntitySourceController } from '../../../../../framework/controller/impl/EntitySourceController';
import { DeactivatedDao, daoManager } from '../../../../../dao';
import { State, GroupState, TransformedState } from '../../../entity';
import { IEntityPersistentController } from '../../../../../framework/controller/interface/IEntityPersistentController';
import { TASK_DATA_TYPE } from '../../../constants';
import {
  StateHandleTask,
  GroupCursorHandleTask,
  StateAndGroupCursorHandleTask,
} from '../../../types';
import { SYNC_SOURCE } from '../../../../sync';
import { ServiceLoader, ServiceConfig } from '../../../../serviceLoader';
import { notificationCenter } from 'sdk/service';
import { IGroupService } from 'sdk/module/group/service/IGroupService';

jest.mock('../../../../../service/notificationCenter');
jest.mock('../../../../../module/config/service/GlobalConfigService');
jest.mock('../../../../../module/config/service/UserConfigService');
jest.mock('../../../../../module/account/config/AccountGlobalConfig');

jest.mock('../StateFetchDataController');
jest.mock('../../../../../framework/controller/impl/EntitySourceController');

type DataHandleTask =
  | StateHandleTask
  | GroupCursorHandleTask
  | StateAndGroupCursorHandleTask;

describe('StateDataHandleController', () => {
  let stateDataHandleController: StateDataHandleController;
  let mockEntitySourceController: EntitySourceController<GroupState>;
  const mockAccountService = { userConfig: { getGlipUserId: jest.fn() } };
  const mockStateService = { myStateConfig: { setMyStateId: jest.fn() } };
  const mockActionController = {
    updateReadStatus: jest.fn(),
  } as any;
  const mockGroupService = ({
    getSynchronously: jest.fn(),
  } as any) as IGroupService;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    mockEntitySourceController = new EntitySourceController<GroupState>(
      {} as IEntityPersistentController<GroupState>,
      {} as DeactivatedDao,
    );
    stateDataHandleController = new StateDataHandleController(
      mockEntitySourceController,
      mockActionController,
      mockGroupService,
    );

    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        if (config === ServiceConfig.ACCOUNT_SERVICE) {
          return mockAccountService;
        }
        if (config === ServiceConfig.STATE_SERVICE) {
          return mockStateService;
        }
        return;
      });
  });

  describe('updateIgnoredStatus', () => {
    it('should update correctly when isIgnored = true', () => {
      stateDataHandleController['_ignoredIdSet'].add(2);
      stateDataHandleController.updateIgnoredStatus([1, 2, 3], true);
      expect(stateDataHandleController['_ignoredIdSet'].size).toEqual(3);
      expect(mockActionController.updateReadStatus).toHaveBeenCalledTimes(2);
    });

    it('should update correctly when isIgnored = false', () => {
      stateDataHandleController['_ignoredIdSet'].add(2);
      stateDataHandleController['_ignoredIdSet'].add(3);
      stateDataHandleController['_ignoredIdSet'].add(4);
      stateDataHandleController.updateIgnoredStatus([1, 2, 4], false);
      expect(stateDataHandleController['_ignoredIdSet'].size).toEqual(1);
    });
  });

  describe('handleState()', () => {
    it('should call _appendTask', async () => {
      const states: Partial<State>[] = [{ id: 123 }];
      stateDataHandleController['_appendTask'] = jest.fn();
      await stateDataHandleController.handleState(states, SYNC_SOURCE.INDEX);
      expect(stateDataHandleController['_appendTask']).toHaveBeenCalledWith(
        {
          type: TASK_DATA_TYPE.STATE,
          data: states,
          ignoreCursorValidate: true,
        },
        SYNC_SOURCE.INDEX,
        undefined,
      );
    });
  });

  describe('handleGroupCursor()', () => {
    it('should call _appendTask', async () => {
      const groups: Partial<Group>[] = [{ id: 123 }];
      stateDataHandleController['_appendTask'] = jest.fn();
      await stateDataHandleController.handleGroupCursor(
        groups,
        SYNC_SOURCE.INITIAL,
      );
      expect(stateDataHandleController['_appendTask']).toHaveBeenCalledWith(
        {
          type: TASK_DATA_TYPE.GROUP_CURSOR,
          data: groups,
          ignoreCursorValidate: true,
        },
        SYNC_SOURCE.INITIAL,
        undefined,
      );
    });
  });

  describe('handleStateAndGroupCursor()', () => {
    it('should call _appendTask', async () => {
      const states: Partial<State>[] = [{ id: 123 }];
      const groups: Partial<Group>[] = [{ id: 123 }];
      stateDataHandleController['_appendTask'] = jest.fn();
      await stateDataHandleController.handleStateAndGroupCursor(
        states,
        groups,
        SYNC_SOURCE.INITIAL,
      );
      expect(stateDataHandleController['_appendTask']).toHaveBeenCalledWith(
        {
          type: TASK_DATA_TYPE.STATE_AND_GROUP_CURSOR,
          data: {
            states,
            groups,
          },
          ignoreCursorValidate: true,
        },
        SYNC_SOURCE.INITIAL,
        undefined,
      );
    });
  });

  describe('_appendTask()', () => {
    it('should handle task when queue is empty', async () => {
      const task = { mock: 'task' } as any;
      stateDataHandleController['_startDataHandleTask'] = jest.fn();
      await stateDataHandleController['_appendTask'](task, SYNC_SOURCE.INITIAL);
      expect(
        stateDataHandleController['_startDataHandleTask'],
      ).toHaveBeenCalledWith(task, SYNC_SOURCE.INITIAL, undefined);
    });
  });

  describe('_startDataHandleTask', () => {
    it('should handle state task and stop the queue', async () => {
      const task: DataHandleTask = { type: TASK_DATA_TYPE.STATE, data: [] };
      stateDataHandleController[
        '_transformStateData'
      ] = jest.fn().mockReturnValue({});
      stateDataHandleController['_transformGroupData'] = jest.fn();
      // prettier-ignore
      stateDataHandleController['_generateUpdatedState'] = jest.fn().mockReturnValue({
        groupStates: {},
      });
      stateDataHandleController['_updateEntitiesAndDoNotification'] = jest.fn();

      await stateDataHandleController['_startDataHandleTask'](task);
      expect(
        stateDataHandleController['_transformStateData'],
      ).toHaveBeenCalledWith(task.data, {
        groupStates: {},
      });
      expect(
        stateDataHandleController['_transformGroupData'],
      ).toHaveBeenCalledTimes(0);
      expect(
        stateDataHandleController['_generateUpdatedState'],
      ).toHaveBeenCalledTimes(1);
      expect(
        stateDataHandleController['_updateEntitiesAndDoNotification'],
      ).toHaveBeenCalledTimes(1);
    });

    it('should handle group task and stop the queue', async () => {
      const task: DataHandleTask = {
        type: TASK_DATA_TYPE.GROUP_CURSOR,
        data: [],
      };
      stateDataHandleController['_transformStateData'] = jest.fn();
      stateDataHandleController[
        '_transformGroupData'
      ] = jest.fn().mockReturnValue({});
      // prettier-ignore
      stateDataHandleController['_generateUpdatedState'] = jest.fn().mockReturnValue({
        groupStates: {},
      });
      stateDataHandleController['_updateEntitiesAndDoNotification'] = jest.fn();

      await stateDataHandleController['_startDataHandleTask'](task);
      expect(
        stateDataHandleController['_transformStateData'],
      ).toHaveBeenCalledTimes(0);
      expect(
        stateDataHandleController['_transformGroupData'],
      ).toHaveBeenCalledWith(task.data, {
        groupStates: {},
      });
      expect(
        stateDataHandleController['_generateUpdatedState'],
      ).toHaveBeenCalledTimes(1);
      expect(
        stateDataHandleController['_updateEntitiesAndDoNotification'],
      ).toHaveBeenCalledTimes(1);
    });

    it('should handle state and group task and stop the queue', async () => {
      const task: DataHandleTask = {
        type: TASK_DATA_TYPE.STATE_AND_GROUP_CURSOR,
        data: {
          states: [{ mock: 'state' } as any],
          groups: [{ mock: 'group' } as any],
        },
      };
      stateDataHandleController['_transformStateData'] = jest.fn();
      stateDataHandleController[
        '_transformGroupData'
      ] = jest.fn().mockReturnValue({});
      // prettier-ignore
      stateDataHandleController['_generateUpdatedState'] = jest.fn().mockReturnValue({
        groupStates: {},
      });
      stateDataHandleController['_updateEntitiesAndDoNotification'] = jest.fn();

      await stateDataHandleController['_startDataHandleTask'](task);
      expect(
        stateDataHandleController['_transformStateData'],
      ).toHaveBeenCalledWith(task.data.states, {
        groupStates: {},
      });
      expect(
        stateDataHandleController['_transformGroupData'],
      ).toHaveBeenCalledWith(task.data.groups, {
        groupStates: {},
      });
      expect(
        stateDataHandleController['_generateUpdatedState'],
      ).toHaveBeenCalledTimes(1);
      expect(
        stateDataHandleController['_updateEntitiesAndDoNotification'],
      ).toHaveBeenCalledTimes(1);
    });

    it('should handle next task when crashing', async () => {
      const task = jest.fn();
      const task2 = jest.fn();
      stateDataHandleController['_taskArray'] = [task, task2];
      stateDataHandleController['_transformStateData'] = jest.fn();
      // prettier-ignore
      stateDataHandleController['_transformGroupData'] = jest.fn().mockReturnValue({});
      // prettier-ignore
      stateDataHandleController['_generateUpdatedState'] = jest.fn().mockReturnValue({
        groupStates: [],
      });
      stateDataHandleController['_updateEntitiesAndDoNotification'] = jest.fn();

      await stateDataHandleController['_startDataHandleTask']({
        type: TASK_DATA_TYPE.GROUP_CURSOR,
        data: 'data' as any,
      });
      expect(task2).toHaveBeenCalled();
      expect(
        stateDataHandleController['_transformGroupData'],
      ).toHaveBeenCalledWith('data', {
        groupStates: {},
      });
      expect(
        stateDataHandleController['_generateUpdatedState'],
      ).toHaveBeenCalled();
      expect(
        stateDataHandleController['_updateEntitiesAndDoNotification'],
      ).toHaveBeenCalled();
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
          last_author_id: 2222333,
        },
        {
          id: 11223344,
          __trigger_ids: [5683],
          post_cursor: 654,
          post_drp_cursor: 321,
          last_author_id: 2223333,
        },
      ];

      mockAccountService.userConfig.getGlipUserId.mockReturnValue(5683);
      const transformedState: TransformedState = {
        groupStates: {},
      };

      stateDataHandleController['_transformGroupData'](
        groups,
        transformedState,
      );
      expect(transformedState).toEqual({
        groupStates: {
          55668833: {
            group_post_cursor: 456,
            group_post_drp_cursor: 789,
            last_author_id: 2222333,
            id: 55668833,
          },
          11223344: {
            group_post_cursor: 654,
            group_post_drp_cursor: 321,
            last_author_id: 2223333,
            id: 11223344,
          },
        },
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
      const transformedState: TransformedState = {
        groupStates: {},
      };

      stateDataHandleController['_transformStateData'](
        states,
        transformedState,
      );
      expect(transformedState).toEqual({
        groupStates: {
          55668833: {
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
        },
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
            last_author_id: 56,
            group_team_mention_cursor: 0,
          },
          {
            id: 2,
            marked_as_unread: true,
            post_cursor: 13,
            read_through: 209,
            unread_deactivated_count: 10,
            unread_mentions_count: 0,
            group_team_mention_cursor: 0,
          },
          {
            id: 3,
            marked_as_unread: true,
            post_cursor: 8,
            read_through: 6,
            unread_deactivated_count: 10,
            unread_mentions_count: 5,
            group_team_mention_cursor: 0,
          },
          {
            id: 4,
            marked_as_unread: false,
            last_author_id: 5684,
            post_cursor: 8,
            group_team_mention_cursor: 0,
          },
        ],
        isSelf: false,
      };

      mockEntitySourceController.getEntitiesLocally = jest
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
            last_author_id: 88,
            group_team_mention_cursor: 0,
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
            group_team_mention_cursor: 0,
          },
          {
            id: 4,
            marked_as_unread: true,
            last_author_id: 56,
            post_cursor: 688,
            group_team_mention_cursor: 0,
          },
        ]);

      mockAccountService.userConfig.getGlipUserId.mockReturnValue(5683);

      expect(
        await stateDataHandleController['_generateUpdatedState'](
          transformedState,
        ),
      ).toEqual({
        groupStates: {
          1: {
            id: 1,
            marked_as_unread: true,
            post_cursor: 18,
            read_through: 7,
            unread_deactivated_count: 1,
            unread_mentions_count: 6,
            group_post_cursor: 15,
            group_post_drp_cursor: 9,
            unread_count: 5,
            last_author_id: 56,
            unread_team_mentions_count: 0,
            group_team_mention_cursor: 0,
          },
          2: {
            group_post_cursor: 15,
            group_post_drp_cursor: 9,
            id: 2,
            marked_as_unread: true,
            post_cursor: 13,
            read_through: 209,
            unread_deactivated_count: 10,
            unread_mentions_count: 0,
            unread_count: 1,
            unread_team_mentions_count: 0,
            group_team_mention_cursor: 0,
          },
          3: {
            id: 3,
            marked_as_unread: true,
            post_cursor: 8,
            read_through: 6,
            unread_deactivated_count: 10,
            unread_mentions_count: 5,
            unread_count: 0,
            unread_team_mentions_count: 0,
            group_team_mention_cursor: 0,
          },
        },
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
        ignoreCursorValidate: true,
        isSelf: true,
      };

      mockEntitySourceController.getEntitiesLocally = jest
        .fn()
        .mockReturnValue([
          {
            id: 1,
            marked_as_unread: true,
            group_post_cursor: 19,
            post_cursor: 16,
            read_through: 7,
            unread_deactivated_count: 0,
            unread_mentions_count: 0,
            unread_count: 1,
            unread_team_mentions_count: 0,
            group_team_mention_cursor: 0,
          },
        ]);

      mockAccountService.userConfig.getGlipUserId.mockReturnValue(5683);

      expect(
        await stateDataHandleController['_generateUpdatedState'](
          transformedState,
        ),
      ).toEqual({
        groupStates: {
          1: {
            id: 1,
            marked_as_unread: true,
            group_post_cursor: 18,
            post_cursor: 16,
            read_through: 7,
            unread_deactivated_count: 0,
            unread_mentions_count: 0,
            unread_count: 0,
            unread_team_mentions_count: 0,
            group_team_mention_cursor: 0,
          },
        },
        myState: undefined,
      });
    });

    it('should return groupState with unread count = 0 when last_author is self and marked_as_unread is false', async () => {
      const transformedState = {
        groupStates: [
          {
            id: 1,
            marked_as_unread: false,
            last_author_id: 5683,
            group_team_mention_cursor: 0,
          },
        ],
        isSelf: false,
      };

      mockEntitySourceController.getEntitiesLocally = jest
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
            unread_team_mentions_count: 0,
            group_team_mention_cursor: 0,
          },
        ]);

      mockAccountService.userConfig.getGlipUserId.mockReturnValue(5683);

      expect(
        await stateDataHandleController['_generateUpdatedState'](
          transformedState,
        ),
      ).toEqual({
        groupStates: {
          1: {
            id: 1,
            marked_as_unread: false,
            group_post_cursor: 17,
            post_cursor: 16,
            read_through: 7,
            unread_deactivated_count: 0,
            unread_mentions_count: 0,
            unread_count: 0,
            last_author_id: 5683,
            unread_team_mentions_count: 0,
            group_team_mention_cursor: 0,
          },
        },
        myState: undefined,
      });
    });
    it('should fix group_team_mention_cursor when state not exist', async () => {
      const transformedState = {
        groupStates: [
          {
            id: 1,
            marked_as_unread: false,
            last_author_id: 11,
          },
        ],
        isSelf: false,
      };

      mockEntitySourceController.getEntitiesLocally = jest
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
            unread_count: 2,
            team_mention_cursor: 1,
            unread_team_mentions_count: 0,
          },
        ]);

      mockAccountService.userConfig.getGlipUserId.mockReturnValue(5683);
      mockGroupService.getSynchronously.mockReturnValue({
        id: 1,
        team_mention_cursor: 2,
      });
      expect(
        await stateDataHandleController['_generateUpdatedState'](
          transformedState,
        ),
      ).toEqual({
        groupStates: {
          1: {
            id: 1,
            marked_as_unread: false,
            group_post_cursor: 17,
            post_cursor: 16,
            read_through: 7,
            unread_deactivated_count: 0,
            unread_mentions_count: 0,
            unread_count: 1,
            last_author_id: 11,
            team_mention_cursor: 1,
            unread_team_mentions_count: 1,
            group_team_mention_cursor: 2,
          },
        },
        myState: undefined,
      });
    });
    it('should fix group_team_mention_cursor when state error', async () => {
      const transformedState = {
        groupStates: [
          {
            id: 1,
            marked_as_unread: false,
            last_author_id: 11,
          },
        ],
        isSelf: false,
      };

      mockEntitySourceController.getEntitiesLocally = jest
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
            unread_count: 2,
            team_mention_cursor: 1,
            unread_team_mentions_count: -2,
          },
        ]);

      mockAccountService.userConfig.getGlipUserId.mockReturnValue(5683);
      mockGroupService.getSynchronously.mockReturnValue({
        id: 1,
        team_mention_cursor: 2,
      });
      expect(
        await stateDataHandleController['_generateUpdatedState'](
          transformedState,
        ),
      ).toEqual({
        groupStates: {
          1: {
            id: 1,
            marked_as_unread: false,
            group_post_cursor: 17,
            post_cursor: 16,
            read_through: 7,
            unread_deactivated_count: 0,
            unread_mentions_count: 0,
            unread_count: 1,
            last_author_id: 11,
            team_mention_cursor: 1,
            unread_team_mentions_count: 1,
            group_team_mention_cursor: 2,
          },
        },
        myState: undefined,
      });
    });
  });

  describe('_hasInvalidCursor', () => {
    it('should return true when GCursor + DCursor is invalid', () => {
      const updateState = {
        group_post_cursor: 3,
        group_post_drp_cursor: 6,
      } as any;
      const localState = {
        group_post_cursor: 5,
        group_post_drp_cursor: 5,
      } as any;
      expect(
        stateDataHandleController['_hasInvalidCursor'](updateState, localState),
      ).toBeTruthy();
    });

    it('should return true when GCursor is invalid', () => {
      const updateState = {
        group_post_cursor: 4,
      } as any;
      const localState = {
        group_post_cursor: 5,
      } as any;
      expect(
        stateDataHandleController['_hasInvalidCursor'](updateState, localState),
      ).toBeTruthy();
    });

    it('should return true when DCursor is invalid', () => {
      const updateState = {
        group_post_drp_cursor: 4,
      } as any;
      const localState = {
        group_post_drp_cursor: 5,
      } as any;
      expect(
        stateDataHandleController['_hasInvalidCursor'](updateState, localState),
      ).toBeTruthy();
    });

    it('should return true when SCursor is invalid', () => {
      const updateState = {
        post_cursor: 3,
        marked_as_unread: false,
      } as any;
      const localState = {
        post_cursor: 5,
      } as any;
      expect(
        stateDataHandleController['_hasInvalidCursor'](updateState, localState),
      ).toBeTruthy();
    });
  });

  describe('_isStateChanged', () => {
    it('should return true when GCursor + DCursor changed', () => {
      const updateState = {
        group_post_cursor: 3,
        group_post_drp_cursor: 8,
      } as any;
      const localState = {
        group_post_cursor: 5,
        group_post_drp_cursor: 5,
      } as any;
      expect(
        stateDataHandleController['_isStateChanged'](updateState, localState),
      ).toBeTruthy();
    });

    it('should return true when GCursor changed', () => {
      const updateState = {
        group_post_cursor: 6,
      } as any;
      const localState = {
        group_post_cursor: 5,
      } as any;
      expect(
        stateDataHandleController['_isStateChanged'](updateState, localState),
      ).toBeTruthy();
    });

    it('should return true when DCursor changed', () => {
      const updateState = {
        group_post_drp_cursor: 8,
      } as any;
      const localState = {
        group_post_drp_cursor: 5,
      } as any;
      expect(
        stateDataHandleController['_isStateChanged'](updateState, localState),
      ).toBeTruthy();
    });

    it('should return true when SCursor changed', () => {
      const updateState = {
        post_cursor: 4,
      } as any;
      const localState = {
        post_cursor: 5,
      } as any;
      expect(
        stateDataHandleController['_isStateChanged'](updateState, localState),
      ).toBeTruthy();
    });

    it('should return true when unread_deactivated_count changed', () => {
      const updateState = {
        unread_deactivated_count: 0,
      } as any;
      const localState = {
        unread_deactivated_count: 2,
      } as any;
      expect(
        stateDataHandleController['_isStateChanged'](updateState, localState),
      ).toBeTruthy();
    });

    it('should return true when unread_mentions_count changed', () => {
      const updateState = {
        unread_mentions_count: 1,
      } as any;
      const localState = {
        unread_mentions_count: 3,
      } as any;
      expect(
        stateDataHandleController['_isStateChanged'](updateState, localState),
      ).toBeTruthy();
    });

    it('should return true when read_through changed', () => {
      const updateState = {
        read_through: 8,
      } as any;
      const localState = {
        read_through: 5,
      } as any;
      expect(
        stateDataHandleController['_isStateChanged'](updateState, localState),
      ).toBeTruthy();
    });

    it('should return true when marked_as_unread changed', () => {
      const updateState = {
        marked_as_unread: false,
      } as any;
      const localState = {
        marked_as_unread: true,
      } as any;
      expect(
        stateDataHandleController['_isStateChanged'](updateState, localState),
      ).toBeTruthy();
    });

    it('should return true when last_author_id changed', () => {
      const updateState = {
        last_author_id: 8444,
      } as any;
      const localState = {
        last_author_id: 51111,
      } as any;
      expect(
        stateDataHandleController['_isStateChanged'](updateState, localState),
      ).toBeTruthy();
    });

    it('should return false when nothing changed', () => {
      const updateState = {
        group_post_cursor: 3,
        group_post_drp_cursor: 8,
        post_cursor: 4,
        unread_deactivated_count: 0,
        unread_mentions_count: 1,
        read_through: 8,
        marked_as_unread: false,
        last_author_id: 8444,
      } as any;
      const localState = {
        group_post_cursor: 3,
        group_post_drp_cursor: 8,
        post_cursor: 4,
        unread_deactivated_count: 0,
        unread_mentions_count: 1,
        read_through: 8,
        marked_as_unread: false,
        last_author_id: 8444,
      } as any;
      expect(
        stateDataHandleController['_isStateChanged'](updateState, localState),
      ).toBeFalsy();
    });

    it('should return true when team_mention_cursor changed', () => {
      const updateState = {
        team_mention_cursor: 8444,
      } as any;
      const localState = {
        team_mention_cursor: 51111,
      } as any;
      expect(
        stateDataHandleController['_isStateChanged'](updateState, localState),
      ).toBeTruthy();
    });
    it('should return true when team_mention_cursor_offset changed', () => {
      const updateState = {
        team_mention_cursor_offset: 8444,
      } as any;
      const localState = {
        team_mention_cursor_offset: 51111,
      } as any;
      expect(
        stateDataHandleController['_isStateChanged'](updateState, localState),
      ).toBeTruthy();
    });
    it('should return true when group_team_mention_cursor changed', () => {
      const updateState = {
        group_team_mention_cursor: 8444,
      } as any;
      const localState = {
        group_team_mention_cursor: 51111,
      } as any;
      expect(
        stateDataHandleController['_isStateChanged'](updateState, localState),
      ).toBeTruthy();
    });
    it('should return true when removed_cursors_team_mention changed', () => {
      const updateState = {
        removed_cursors_team_mention: [1],
      } as any;
      const localState = {
        removed_cursors_team_mention: [1, 3],
      } as any;
      expect(
        stateDataHandleController['_isStateChanged'](updateState, localState),
      ).toBeTruthy();
    });
  });

  describe('_calculateUnread', () => {
    it('should return 0 when isSelf = true', () => {
      const finalState = {
        last_author_id: 123,
      } as any;
      expect(
        stateDataHandleController['_calculateUnread'](finalState, true, 11),
      ).toEqual(0);
    });

    it('should return 0 when last_author_id is self and marked_as_unread != true', () => {
      const finalState = {
        last_author_id: 123,
        marked_as_unread: false,
      } as any;
      expect(
        stateDataHandleController['_calculateUnread'](finalState, false, 123),
      ).toEqual(0);
    });

    it('should return calculated unread', () => {
      const finalState = {
        last_author_id: 123,
        marked_as_unread: false,
        group_post_cursor: 9,
        group_post_drp_cursor: 2,
        post_cursor: 3,
        unread_deactivated_count: 5,
      } as any;
      expect(
        stateDataHandleController['_calculateUnread'](finalState, false, 11),
      ).toEqual(3);
    });
  });

  describe('_updateEntitiesAndDoNotification', () => {
    it('should update and notify non-ignore conversation correctly', async () => {
      const mockUpdate = jest.fn();
      daoManager.getDao = jest.fn().mockReturnValueOnce({
        update: mockUpdate,
      });
      const transformedState = {
        myState: { id: 123 },
        groupStates: [
          {
            id: 3444,
          },
          {
            id: 3456,
            unread_count: 0,
          },
          {
            id: 6789,
            unread_count: 9,
          },
        ],
      } as any;
      stateDataHandleController['_ignoredIdSet'].add(3456);
      stateDataHandleController['_ignoredIdSet'].add(6789);
      await stateDataHandleController['_updateEntitiesAndDoNotification'](
        transformedState,
      );
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockActionController.updateReadStatus).toHaveBeenCalledTimes(1);
      expect(mockActionController.updateReadStatus).toBeCalledWith(6789, false, true);
      expect(mockStateService.myStateConfig.setMyStateId).toHaveBeenCalledTimes(
        1,
      );
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(2);
      expect(mockEntitySourceController.bulkUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe('_calculateTeamMentionUnread()', () => {
    it('should not calculate self groupState change', () => {
      const unreadTeamMentionCount = stateDataHandleController[
        '_calculateTeamMentionUnread'
      ]({} as GroupState, true, 1233);
      expect(unreadTeamMentionCount).toEqual(0);
    });

    it('should unread count equal (total count - read count)', () => {
      const unreadTeamMentionCount = stateDataHandleController[
        '_calculateTeamMentionUnread'
      ](
        {
          group_team_mention_cursor: 100,
          team_mention_cursor: 22,
        } as GroupState,
        false,
        1233,
      );
      expect(unreadTeamMentionCount).toEqual(78);
    });

    it('should minus removed mention posts [JPT-2642]', () => {
      const unreadTeamMentionCount = stateDataHandleController[
        '_calculateTeamMentionUnread'
      ](
        {
          group_team_mention_cursor: 100,
          team_mention_cursor: 22,
          removed_cursors_team_mention: [1, 26],
        } as GroupState,
        false,
        1233,
      );
      expect(unreadTeamMentionCount).toEqual(77);
    });

    it('should minus removed mention posts(only in unread list)', async () => {
      const unreadTeamMentionCount = stateDataHandleController[
        '_calculateTeamMentionUnread'
      ](
        {
          group_team_mention_cursor: 100,
          team_mention_cursor: 22,
          removed_cursors_team_mention: [1, 22],
        } as GroupState,
        false,
        1233,
      );
      expect(unreadTeamMentionCount).toEqual(78);
    });

    it('should consider team_mention_cursor_offset', async () => {
      const unreadTeamMentionCount = stateDataHandleController[
        '_calculateTeamMentionUnread'
      ](
        {
          group_team_mention_cursor: 100,
          team_mention_cursor: 22,
          team_mention_cursor_offset: 33,
        } as GroupState,
        false,
        1233,
      );
      expect(unreadTeamMentionCount).toEqual(67);
    });
    it('should consider team_mention_cursor_offset', async () => {
      const unreadTeamMentionCount = stateDataHandleController[
        '_calculateTeamMentionUnread'
      ](
        {
          group_team_mention_cursor: 100,
          team_mention_cursor: 22,
          team_mention_cursor_offset: 11,
        } as GroupState,
        false,
        1233,
      );
      expect(unreadTeamMentionCount).toEqual(78);
    });
  });
});
