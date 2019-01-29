/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-17 13:39:19
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import {
  daoManager,
  StateDao,
  AccountDao,
  ConfigDao,
  MY_STATE_ID,
  ACCOUNT_USER_ID,
} from '../../../../dao';
import { State, GroupState, TransformedState } from '../../entity';
import { Group } from '../../../group/entity';
import { ENTITY } from '../../../../service/eventKey';
import { TASK_DATA_TYPE } from '../../constants';
import {
  stateHandleTask,
  groupHandleTask,
  dataHandleTask,
  dataHandleTaskArray,
} from '../../types';
import notificationCenter from '../../../../service/notificationCenter';
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';
import { StateFetchDataController } from './StateFetchDataController';
import { mainLogger } from 'foundation';

class StateDataHandleController {
  private _taskArray: dataHandleTaskArray;
  constructor(
    private _entitySourceController: IEntitySourceController<GroupState>,
    private _stateFetchDataController: StateFetchDataController,
  ) {
    this._taskArray = [];
  }

  async handleState(states: Partial<State>[]): Promise<void> {
    if (states.length === 0) {
      mainLogger.info(
        '[StateDataHandleController] Invalid state change trigger',
      );
      return;
    }
    const stateTask: stateHandleTask = {
      type: TASK_DATA_TYPE.STATE,
      data: states,
    };
    this._taskArray.push(stateTask);
    if (this._taskArray.length === 1) {
      this._startDataHandleTask(this._taskArray[0]);
    }
  }

  async handlePartialGroup(groups: Partial<Group>[]): Promise<void> {
    if (groups.length === 0) {
      mainLogger.info(
        '[StateDataHandleController] Invalid partial group change trigger',
      );
      return;
    }
    const groupTask: groupHandleTask = {
      type: TASK_DATA_TYPE.GROUP,
      data: groups,
    };
    this._taskArray.push(groupTask);
    if (this._taskArray.length === 1) {
      this._startDataHandleTask(this._taskArray[0]);
    }
  }

  async handleGroupChanges(groups?: Group[]): Promise<void> {
    if (!groups || !groups.length) {
      mainLogger.info(
        '[StateDataHandleController] Invalid group change trigger',
      );
      return;
    }
    const groupTask: groupHandleTask = {
      type: TASK_DATA_TYPE.GROUP,
      data: groups,
    };
    this._taskArray.push(groupTask);
    if (this._taskArray.length === 1) {
      this._startDataHandleTask(this._taskArray[0]);
    }
  }

  private async _startDataHandleTask(task: dataHandleTask): Promise<void> {
    let transformedState: TransformedState;
    if (task.type === TASK_DATA_TYPE.STATE) {
      transformedState = this._transformStateData(task.data);
    } else {
      transformedState = this._transformGroupData(task.data);
    }
    const updatedState = await this._generateUpdatedState(transformedState);
    await this._updateEntitiesAndDoNotification(updatedState);
    this._taskArray.shift();
    if (this._taskArray.length > 0) {
      this._startDataHandleTask(this._taskArray[0]);
    }
  }

  private _transformGroupData(groups: Partial<Group>[]): TransformedState {
    const transformedState: TransformedState = {
      groupStates: [],
      isSelf: false,
    };
    transformedState.groupStates = _.compact(
      groups.map((group: Partial<State>) => {
        const groupId = group._id || group.id;
        if (!groupId) {
          return;
        }
        const groupState: GroupState = { id: groupId };
        Object.keys(group).forEach((key: string) => {
          switch (key) {
            case '__trigger_ids': {
              const triggerIds = group[key];
              const currentUserId: number = daoManager
                .getKVDao(AccountDao)
                .get(ACCOUNT_USER_ID);
              if (
                triggerIds &&
                currentUserId &&
                triggerIds.includes(currentUserId)
              ) {
                transformedState.isSelf = true;
              }
              break;
            }
            case 'post_cursor': {
              groupState.group_post_cursor = group[key];
              break;
            }
            case 'drp_post_cursor': {
              groupState.group_post_drp_cursor = group[key];
              break;
            }
          }
        });
        return groupState;
      }),
    );
    return transformedState;
  }

  private _transformStateData(states: Partial<State>[]): TransformedState {
    const transformedState: TransformedState = {
      groupStates: [],
      isSelf: false,
    };
    const myState: Partial<State> = {};
    const groupStates = {};
    const groupIds = new Set();
    states.forEach((state: Partial<State>) => {
      Object.keys(state).forEach((key: string) => {
        if (key.includes('unread_count')) {
          return;
        }
        if (key === '_id') {
          myState.id = state[key];
          return;
        }
        const keys = [
          'deactivated_post_cursor',
          'group_missed_calls_count',
          'group_tasks_count',
          'last_read_through',
          'unread_mentions_count',
          'read_through',
          'marked_as_unread',
          'post_cursor',
          'previous_post_cursor',
          'unread_deactivated_count',
          // 'unread_count', this field is generated in new UMI implementation
        ];
        const matches = key.match(new RegExp(`(${keys.join('|')}):(\\d+)`));
        if (matches) {
          const groupStateKey = matches[1];
          const groupId = matches[2];
          const value = state[key];
          if (!groupStates[groupId]) {
            groupStates[groupId] = {
              id: Number(groupId),
            };
          }
          groupStates[groupId][groupStateKey] = value;
          groupIds.add(groupId);
          return;
        }
        myState[key] = state[key];
      });
    });
    if (myState.id && myState.id > 0) {
      transformedState.myState = myState as State;
    }
    transformedState.groupStates = Array.from(groupIds).map(
      id => groupStates[id],
    );
    return transformedState;
  }

  private async _generateUpdatedState(
    transformedState: TransformedState,
  ): Promise<TransformedState> {
    const updatedState: TransformedState = {
      groupStates: [],
      myState: transformedState.myState,
      isSelf: transformedState.isSelf,
    };
    if (transformedState.groupStates.length > 0) {
      const groupStates = transformedState.groupStates;
      const ids = _.map(groupStates, 'id');
      const localGroupStates = await this._stateFetchDataController.getAllGroupStatesFromLocal(
        ids,
      );
      updatedState.groupStates = _.compact(
        groupStates.map((groupState: GroupState) => {
          let stateChanged: boolean = false;
          const localGroupState = _.find(localGroupStates, {
            id: groupState.id,
          });
          if (localGroupState) {
            if (
              groupState.group_post_cursor &&
              groupState.group_post_drp_cursor
            ) {
              if (
                groupState.group_post_cursor +
                  groupState.group_post_drp_cursor <
                (localGroupState.group_post_cursor || 0) +
                  (localGroupState.group_post_drp_cursor || 0)
              ) {
                mainLogger.info(
                  '[StateDataHandleController]: invalid group_post_cursor and group_post_drp_cursor change',
                );
                return;
              }
              if (
                groupState.group_post_cursor !==
                  (localGroupState.group_post_cursor || 0) ||
                groupState.group_post_drp_cursor !==
                  (localGroupState.group_post_drp_cursor || 0)
              ) {
                stateChanged = true;
              }
            } else if (groupState.group_post_cursor) {
              if (
                groupState.group_post_cursor <
                (localGroupState.group_post_cursor || 0)
              ) {
                mainLogger.info(
                  '[StateDataHandleController]: invalid group_post_cursor change',
                );
                return;
              }
              if (
                groupState.group_post_cursor >
                (localGroupState.group_post_cursor || 0)
              ) {
                stateChanged = true;
              }
            } else if (groupState.group_post_drp_cursor) {
              if (
                groupState.group_post_drp_cursor <
                (localGroupState.group_post_drp_cursor || 0)
              ) {
                mainLogger.info(
                  '[StateDataHandleController]: invalid group_post_drp_cursor change',
                );
                return;
              }
              if (
                groupState.group_post_drp_cursor >
                (localGroupState.group_post_drp_cursor || 0)
              ) {
                stateChanged = true;
              }
            }
            if (groupState.post_cursor) {
              if (groupState.post_cursor > (localGroupState.post_cursor || 0)) {
                stateChanged = true;
              } else if (
                groupState.post_cursor < (localGroupState.post_cursor || 0)
              ) {
                if (!groupState.marked_as_unread) {
                  mainLogger.info(
                    `[StateDataHandleController]: invalid state_post_cursor change: ${groupState}`,
                  );
                  return;
                }
                stateChanged = true;
              }
            }
            if (
              groupState.unread_deactivated_count &&
              groupState.unread_deactivated_count !==
                (localGroupState.unread_deactivated_count || 0)
            ) {
              stateChanged = true;
            }
            if (
              groupState.unread_mentions_count &&
              groupState.unread_mentions_count !==
                (localGroupState.unread_mentions_count || 0)
            ) {
              stateChanged = true;
            }
            if (
              groupState.read_through &&
              groupState.read_through > (localGroupState.read_through || 0)
            ) {
              stateChanged = true;
            }
            if (!stateChanged) {
              return;
            }
          }
          const resultGroupState = _.merge({}, localGroupState, groupState);

          // calculate umi
          if (transformedState.isSelf) {
            resultGroupState.unread_count = 0;
          } else {
            const group_cursor =
              (resultGroupState.group_post_cursor || 0) +
              (resultGroupState.group_post_drp_cursor || 0);
            const state_cursor =
              (resultGroupState.post_cursor || 0) +
              (resultGroupState.unread_deactivated_count || 0);
            resultGroupState.unread_count = Math.max(
              group_cursor - state_cursor,
              0,
            );
          }

          if (resultGroupState.unread_count > 0) {
            resultGroupState.marked_as_unread = true;
          } else {
            resultGroupState.marked_as_unread = false;
          }
          return resultGroupState;
        }),
      );
    }
    return updatedState;
  }

  private async _updateEntitiesAndDoNotification(
    transformedState: TransformedState,
  ): Promise<void> {
    if (transformedState.myState) {
      const myState = transformedState.myState;
      await daoManager.getDao(StateDao).update(myState);
      await daoManager.getKVDao(ConfigDao).put(MY_STATE_ID, myState.id);
      notificationCenter.emitEntityUpdate(
        ENTITY.MY_STATE,
        [myState],
        [myState],
      );
    }
    if (transformedState.groupStates.length > 0) {
      await this._entitySourceController.bulkUpdate(
        transformedState.groupStates,
      );
      notificationCenter.emitEntityUpdate(
        ENTITY.GROUP_STATE,
        transformedState.groupStates,
        transformedState.groupStates,
      );
    }
  }
}

export { StateDataHandleController };
