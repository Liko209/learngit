/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-17 13:39:19
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { daoManager, StateDao } from '../../../../dao';
import { State, GroupState, TransformedState } from '../../entity';
import { Group } from '../../../group/entity';
import { ENTITY } from '../../../../service/eventKey';
import { TASK_DATA_TYPE } from '../../constants';
import { StateHandleTask, GroupCursorHandleTask } from '../../types';
import notificationCenter from '../../../../service/notificationCenter';
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';
import { StateFetchDataController } from './StateFetchDataController';
import { TotalUnreadController } from './TotalUnreadController';
import { mainLogger } from 'foundation';
import { AccountGlobalConfig } from '../../../../service/account/config';
import { NewUserConfig } from '../../../../service/config';

type DataHandleTask = StateHandleTask | GroupCursorHandleTask;

class StateDataHandleController {
  private _taskArray: DataHandleTask[];
  constructor(
    private _entitySourceController: IEntitySourceController<GroupState>,
    private _stateFetchDataController: StateFetchDataController,
    private _totalUnreadController: TotalUnreadController,
  ) {
    this._taskArray = [];
  }

  handleState(states: Partial<State>[]): void {
    const stateTask: DataHandleTask = {
      type: TASK_DATA_TYPE.STATE,
      data: states,
    };
    this._taskArray.push(stateTask);
    if (this._taskArray.length === 1) {
      this._startDataHandleTask(this._taskArray[0]);
    }
  }

  handleGroupCursor(groups: Partial<Group>[]): void {
    const groupTask: DataHandleTask = {
      type: TASK_DATA_TYPE.GROUP_CURSOR,
      data: groups,
    };
    this._taskArray.push(groupTask);
    if (this._taskArray.length === 1) {
      this._startDataHandleTask(this._taskArray[0]);
    }
  }

  private async _startDataHandleTask(task: DataHandleTask): Promise<void> {
    let transformedState: TransformedState;
    if (task.type === TASK_DATA_TYPE.STATE) {
      transformedState = this._transformStateData(task.data);
    } else {
      transformedState = this._transformGroupData(task.data);
    }
    const updatedState = await this._generateUpdatedState(transformedState);
    await this._updateEntitiesAndDoNotification(updatedState);
    await this._totalUnreadController.handleGroupState(
      updatedState.groupStates,
    );

    this._taskArray.shift();
    if (this._taskArray.length > 0) {
      this._startDataHandleTask(this._taskArray[0]);
    }
  }

  private _transformGroupData(groups: Partial<Group>[]): TransformedState {
    const transformedState: TransformedState = {
      groupStates: [],
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
              const currentUserId: number = AccountGlobalConfig.getInstance().getCurrentUserId();
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
        if (key === '__from_index') {
          transformedState.isFromIndexData = true;
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
                if (
                  !groupState.marked_as_unread &&
                  !transformedState.isFromIndexData
                ) {
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
          }
          const resultGroupState = _.merge({}, localGroupState, groupState);

          // calculate umi
          let unreadCount: number = 0;
          if (transformedState.isSelf) {
            unreadCount = 0;
          } else {
            const group_cursor =
              (resultGroupState.group_post_cursor || 0) +
              (resultGroupState.group_post_drp_cursor || 0);
            const state_cursor =
              (resultGroupState.post_cursor || 0) +
              (resultGroupState.unread_deactivated_count || 0);
            unreadCount = Math.max(group_cursor - state_cursor, 0);
          }

          if (unreadCount !== resultGroupState.unread_count) {
            resultGroupState.unread_count = unreadCount;
            stateChanged = true;
          }

          if (resultGroupState.unread_count > 0) {
            resultGroupState.marked_as_unread = true;
          } else {
            resultGroupState.marked_as_unread = false;
          }
          return stateChanged ? resultGroupState : undefined;
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
      const newConfig = new NewUserConfig();
      await newConfig.setMyStateId(myState.id);
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
