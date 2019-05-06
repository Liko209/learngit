/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-17 13:39:19
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { daoManager } from '../../../../dao';
import { StateDao } from '../../dao';
import { State, GroupState, TransformedState } from '../../entity';
import { Group } from '../../../group/entity';
import { ENTITY } from '../../../../service/eventKey';
import { TASK_DATA_TYPE } from '../../constants';
import { StateHandleTask, GroupCursorHandleTask } from '../../types';
import notificationCenter from '../../../../service/notificationCenter';
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';
import { StateFetchDataController } from './StateFetchDataController';
import { mainLogger } from 'foundation';
import { AccountUserConfig } from '../../../../module/account/config';
import { MyStateConfig } from '../../../state/config';
import { SYNC_SOURCE, ChangeModel } from '../../../../module/sync/types';
import { shouldEmitNotification } from '../../../../utils/notificationUtils';

type DataHandleTask = StateHandleTask | GroupCursorHandleTask;
const LOG_TAG = 'StateDataHandleController';

class StateDataHandleController {
  private _taskArray: DataHandleTask[];
  constructor(
    private _entitySourceController: IEntitySourceController<GroupState>,
    private _stateFetchDataController: StateFetchDataController,
  ) {
    this._taskArray = [];
  }

  async handleState(
    states: Partial<State>[],
    source: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ): Promise<void> {
    const stateTask: DataHandleTask = {
      type: TASK_DATA_TYPE.STATE,
      data: states,
    };
    this._taskArray.push(stateTask);
    if (this._taskArray.length === 1) {
      await this._startDataHandleTask(this._taskArray[0], source, changeMap);
    }
  }

  async handleGroupCursor(groups: Partial<Group>[]): Promise<void> {
    const groupTask: DataHandleTask = {
      type: TASK_DATA_TYPE.GROUP_CURSOR,
      data: groups,
    };
    this._taskArray.push(groupTask);
    if (this._taskArray.length === 1) {
      await this._startDataHandleTask(this._taskArray[0]);
    }
  }

  private async _startDataHandleTask(
    task: DataHandleTask,
    source?: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ): Promise<void> {
    try {
      let transformedState: TransformedState;
      if (task.type === TASK_DATA_TYPE.STATE) {
        transformedState = this._transformStateData(task.data);
      } else {
        transformedState = this._transformGroupData(task.data);
      }
      const updatedState = await this._generateUpdatedState(transformedState);
      await this._updateEntitiesAndDoNotification(
        updatedState,
        source,
        changeMap,
      );
    } catch (err) {
      mainLogger.error(`StateDataHandleController, handle task error, ${err}`);
    }

    this._taskArray.shift();
    if (this._taskArray.length > 0) {
      this._startDataHandleTask(this._taskArray[0]);
    }
  }

  private _transformGroupData(groupArray: any): TransformedState {
    const transformedState: TransformedState = {
      groupStates: [],
    };
    let groups = groupArray;
    if (groups && groups.body) {
      if (groups.body.partials) {
        groups = Array.from(groups.body.partials.values());
      } else if (groups.body.entities) {
        groups = Array.from(groups.body.entities.values());
      }
    }

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
              const userConfig = new AccountUserConfig();
              const currentUserId: number = userConfig.getGlipUserId();
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
            case 'post_drp_cursor': {
              groupState.group_post_drp_cursor = group[key];
              break;
            }
            case 'last_author_id': {
              groupState.last_author_id = group[key];
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
    if (myState.id !== undefined && myState.id > 0) {
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
      const localGroupStates =
        (await this._stateFetchDataController.getAllGroupStatesFromLocal(
          ids,
        )) || [];
      const userConfig = new AccountUserConfig();
      const currentUserId: number = userConfig.getGlipUserId();
      updatedState.groupStates = _.compact(
        groupStates.map((groupState: GroupState) => {
          let stateChanged: boolean = false;
          const localGroupState = _.find(localGroupStates, {
            id: groupState.id,
          });
          if (localGroupState) {
            if (
              this._hasInvalidCursor(
                groupState,
                localGroupState,
                transformedState.isFromIndexData || false,
              )
            ) {
              return;
            }
            stateChanged = this._isStateChanged(groupState, localGroupState);
          }
          const resultGroupState = _.merge({}, localGroupState, groupState);

          // when read group in local , it may only change the unread_count, so we should calculate umi every time
          const updateUnread = this._calculateUnread(
            resultGroupState,
            transformedState.isSelf || false,
            currentUserId,
          );
          if (updateUnread !== resultGroupState.unread_count) {
            mainLogger
              .tags(LOG_TAG)
              .info(
                `umi:${resultGroupState.unread_count}->${updateUnread}, id:${
                  groupState.id
                }, lastPoster:${resultGroupState.last_author_id}, mark:${
                  resultGroupState.marked_as_unread
                }`,
              );
            resultGroupState.unread_count = updateUnread;
            stateChanged = true;
          }
          return stateChanged ? resultGroupState : undefined;
        }),
      );
    }
    return updatedState;
  }

  private _hasInvalidCursor(
    updateState: GroupState,
    localState: GroupState,
    isFromIndex: boolean,
  ): boolean {
    if (
      updateState.group_post_cursor !== undefined &&
      updateState.group_post_drp_cursor !== undefined
    ) {
      if (
        updateState.group_post_cursor + updateState.group_post_drp_cursor <
        (localState.group_post_cursor || 0) +
          (localState.group_post_drp_cursor || 0)
      ) {
        mainLogger
          .tags(LOG_TAG)
          .info(
            `invalid GCursor:${updateState.group_post_cursor}, DCursor:${
              updateState.group_post_drp_cursor
            }, id:${updateState.id}`,
          );
        return true;
      }
    } else if (updateState.group_post_cursor !== undefined) {
      if (updateState.group_post_cursor < (localState.group_post_cursor || 0)) {
        mainLogger
          .tags(LOG_TAG)
          .info(
            `invalid GCursor:${updateState.group_post_cursor}, id:${
              updateState.id
            }`,
          );
        return true;
      }
    } else if (updateState.group_post_drp_cursor !== undefined) {
      if (
        updateState.group_post_drp_cursor <
        (localState.group_post_drp_cursor || 0)
      ) {
        mainLogger
          .tags(LOG_TAG)
          .info(
            `invalid DCursor:${updateState.group_post_drp_cursor}, id:${
              updateState.id
            }`,
          );
        return true;
      }
    }
    if (
      updateState.post_cursor !== undefined &&
      updateState.post_cursor < (localState.post_cursor || 0) &&
      !updateState.marked_as_unread &&
      !isFromIndex
    ) {
      mainLogger
        .tags(LOG_TAG)
        .info(
          `invalid SCursor:${updateState.post_cursor}, id:${updateState.id}`,
        );
      return true;
    }
    return false;
  }

  private _isStateChanged(
    updateState: GroupState,
    localState: GroupState,
  ): boolean {
    if (
      updateState.group_post_cursor !== undefined &&
      updateState.group_post_drp_cursor !== undefined &&
      (updateState.group_post_cursor !== localState.group_post_cursor ||
        updateState.group_post_drp_cursor !== localState.group_post_drp_cursor)
    ) {
      mainLogger
        .tags(LOG_TAG)
        .info(
          `GCursor:${localState.group_post_cursor}->${
            updateState.group_post_cursor
          }, DCursor: ${localState.group_post_drp_cursor}->${
            updateState.group_post_drp_cursor
          }, id:${updateState.id}`,
        );
      return true;
    }
    if (
      updateState.group_post_cursor !== undefined &&
      updateState.group_post_cursor !== localState.group_post_cursor
    ) {
      mainLogger
        .tags(LOG_TAG)
        .info(
          `GCursor:${localState.group_post_cursor}->${
            updateState.group_post_cursor
          }, id:${updateState.id}`,
        );
      return true;
    }
    if (
      updateState.group_post_drp_cursor !== undefined &&
      updateState.group_post_drp_cursor !== localState.group_post_drp_cursor
    ) {
      mainLogger
        .tags(LOG_TAG)
        .info(
          `DCursor:${localState.group_post_drp_cursor}->${
            updateState.group_post_drp_cursor
          }, id:${updateState.id}`,
        );
      return true;
    }
    if (
      updateState.post_cursor !== undefined &&
      updateState.post_cursor !== localState.post_cursor
    ) {
      mainLogger
        .tags(LOG_TAG)
        .info(
          `SCursor:${localState.post_cursor}->${updateState.post_cursor}, id:${
            updateState.id
          }`,
        );
      return true;
    }
    if (
      updateState.unread_deactivated_count !== undefined &&
      updateState.unread_deactivated_count !==
        localState.unread_deactivated_count
    ) {
      return true;
    }
    if (
      updateState.unread_mentions_count !== undefined &&
      updateState.unread_mentions_count !== localState.unread_mentions_count
    ) {
      return true;
    }
    if (
      updateState.read_through !== undefined &&
      updateState.read_through > (localState.read_through || 0)
    ) {
      return true;
    }
    if (
      updateState.marked_as_unread !== undefined &&
      updateState.marked_as_unread !== localState.marked_as_unread
    ) {
      return true;
    }
    if (
      updateState.last_author_id !== undefined &&
      updateState.last_author_id !== localState.last_author_id
    ) {
      return true;
    }
    return false;
  }

  private _calculateUnread(
    finalState: GroupState,
    isSelf: boolean,
    currentUserId: number,
  ): number {
    if (
      isSelf ||
      (finalState.last_author_id === currentUserId &&
        finalState.marked_as_unread !== true)
    ) {
      return 0;
    }
    const group_cursor =
      (finalState.group_post_cursor || 0) +
      (finalState.group_post_drp_cursor || 0);
    const state_cursor =
      (finalState.post_cursor || 0) +
      (finalState.unread_deactivated_count || 0);
    return Math.max(group_cursor - state_cursor, 0);
  }

  private async _updateEntitiesAndDoNotification(
    transformedState: TransformedState,
    source?: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ): Promise<void> {
    if (transformedState.myState) {
      const myState = transformedState.myState;
      try {
        await daoManager.getDao(StateDao).update(myState);
        const config = new MyStateConfig();
        await config.setMyStateId(myState.id);
      } catch (err) {
        mainLogger.error(`StateDataHandleController, my state error, ${err}`);
      }
      // if (Date.now() === 0) {
      if (changeMap) {
        changeMap.set(ENTITY.MY_STATE, {
          entities: [myState],
          partials: [myState],
        });
      } else {
        notificationCenter.emitEntityUpdate(
          ENTITY.MY_STATE,
          [myState],
          [myState],
        );
      }
      // }
    }
    if (transformedState.groupStates.length > 0) {
      await this._entitySourceController.bulkUpdate(
        transformedState.groupStates,
      );
      if (shouldEmitNotification(source)) {
        if (changeMap) {
          changeMap.set(ENTITY.GROUP_STATE, {
            entities: transformedState.groupStates,
            partials: transformedState.groupStates,
          });
        } else {
          notificationCenter.emitEntityUpdate(
            ENTITY.GROUP_STATE,
            transformedState.groupStates,
            transformedState.groupStates,
          );
        }
      }
    }
  }
}

export { StateDataHandleController };
