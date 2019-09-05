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
import { TASK_DATA_TYPE, GROUP_STATE_KEY, GROUP_KEY } from '../../constants';
import {
  StateHandleTask,
  GroupCursorHandleTask,
  StateAndGroupCursorHandleTask,
} from '../../types';
import notificationCenter from '../../../../service/notificationCenter';
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';
import { mainLogger } from 'foundation/log';
import { AccountService } from '../../../account/service';
import { StateService } from '../../service';
import { SYNC_SOURCE, ChangeModel } from '../../../sync/types';
import { shouldEmitNotification } from '../../../../utils/notificationUtils';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { StateActionController } from './StateActionController';
import { UndefinedAble } from 'sdk/types';
import { IGroupService } from 'sdk/module/group';

type DataHandleTask =
  | StateHandleTask
  | GroupCursorHandleTask
  | StateAndGroupCursorHandleTask;
const LOG_TAG = 'StateDataHandleController';
const GROUP_STATE_KEYS = [
  GROUP_STATE_KEY.DEACTIVATED_POST_CURSOR,
  GROUP_STATE_KEY.GROUP_MISSED_CALLS_COUNT,
  GROUP_STATE_KEY.GROUP_TASKS_COUNT,
  GROUP_STATE_KEY.LAST_READ_THROUGH,
  GROUP_STATE_KEY.UNREAD_MENTIONS_COUNT,
  GROUP_STATE_KEY.READ_THROUGH,
  GROUP_STATE_KEY.MARKED_AS_UNREAD,
  GROUP_STATE_KEY.POST_CURSOR,
  GROUP_STATE_KEY.PREVIOUS_POST_CURSOR,
  GROUP_STATE_KEY.UNREAD_DEACTIVATED_COUNT,
  GROUP_STATE_KEY.TEAM_MENTION_CURSOR,
  // 'unread_count', this field is generated in new UMI implementation
];
const STATE_REGEXP = new RegExp(`^(${GROUP_STATE_KEYS.join('|')}):(\\d+)`);

class StateDataHandleController {
  private _taskArray: (() => Promise<void>)[];
  private _ignoredIdSet: Set<number>;

  constructor(
    private _entitySourceController: IEntitySourceController<GroupState>,
    private _actionController: StateActionController,
    private _groupService: IGroupService,
  ) {
    this._taskArray = [];
    this._ignoredIdSet = new Set<number>();
  }

  updateIgnoredStatus(ids: number[], isIgnored: boolean) {
    if (isIgnored) {
      ids.forEach((id: number) => {
        if (!this._ignoredIdSet.has(id)) {
          this._ignoredIdSet.add(id);
          this._actionController.updateReadStatus(id, false, true);
        }
      });
    } else {
      ids.forEach(id => this._ignoredIdSet.delete(id));
    }
  }

  handleState(
    states: Partial<State>[],
    source?: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ): Promise<void> {
    const ignoreCursorValidate =
      source &&
      [SYNC_SOURCE.INDEX, SYNC_SOURCE.INITIAL, SYNC_SOURCE.REMAINING].includes(
        source,
      );
    const task: DataHandleTask = {
      ignoreCursorValidate,
      type: TASK_DATA_TYPE.STATE,
      data: states,
    };
    return this._appendTask(task, source, changeMap);
  }

  handleGroupCursor(
    groups: Partial<Group>[],
    source?: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ): Promise<void> {
    const ignoreCursorValidate =
      source &&
      [SYNC_SOURCE.INDEX, SYNC_SOURCE.INITIAL, SYNC_SOURCE.REMAINING].includes(
        source,
      );
    const task: DataHandleTask = {
      ignoreCursorValidate,
      type: TASK_DATA_TYPE.GROUP_CURSOR,
      data: groups,
    };
    return this._appendTask(task, source, changeMap);
  }

  handleStateAndGroupCursor(
    states: Partial<State>[],
    groups: Partial<Group>[],
    source?: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ): Promise<void> {
    const ignoreCursorValidate =
      source &&
      [SYNC_SOURCE.INDEX, SYNC_SOURCE.INITIAL, SYNC_SOURCE.REMAINING].includes(
        source,
      );
    const task: DataHandleTask = {
      ignoreCursorValidate,
      type: TASK_DATA_TYPE.STATE_AND_GROUP_CURSOR,
      data: { states, groups },
    };
    return this._appendTask(task, source, changeMap);
  }

  private async _appendTask(
    task: DataHandleTask,
    source?: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ) {
    // should append task and keep promise
    return new Promise<void>(resolve => {
      this._taskArray.push(async () => {
        await this._startDataHandleTask(task, source, changeMap);
        resolve();
      });
      if (this._taskArray.length === 1) {
        this._taskArray[0]();
      }
    });
  }

  private async _startDataHandleTask(
    task: DataHandleTask,
    source?: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ): Promise<void> {
    try {
      const transformedState: TransformedState = {
        groupStates: {},
      };
      switch (task.type) {
        case TASK_DATA_TYPE.STATE: {
          this._transformStateData(task.data, transformedState);
          break;
        }
        case TASK_DATA_TYPE.GROUP_CURSOR: {
          this._transformGroupData(task.data, transformedState);
          break;
        }
        case TASK_DATA_TYPE.STATE_AND_GROUP_CURSOR: {
          this._transformStateData(task.data.states, transformedState);
          this._transformGroupData(task.data.groups, transformedState);
          break;
        }
        default:
          break;
      }
      transformedState.ignoreCursorValidate = task.ignoreCursorValidate;
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
      this._taskArray[0]();
    }
  }

  private _transformGroupData(
    groupArray: any,
    transformedState: TransformedState,
  ): void {
    let groups = groupArray;
    if (groups && groups.body) {
      if (groups.body.partials) {
        groups = Array.from(groups.body.partials.values());
      } else if (groups.body.entities) {
        groups = Array.from(groups.body.entities.values());
      }
    }

    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const currentUserId: number = userConfig.getGlipUserId();

    groups.forEach((group: Partial<Group>) => {
      const groupId = group._id || group.id;
      if (!groupId) {
        return;
      }
      const groupState: GroupState = { id: groupId };

      if (group[GROUP_KEY.__TRIGGER_IDS]) {
        const triggerIds: UndefinedAble<number[]> =
          group[GROUP_KEY.__TRIGGER_IDS];
        if (_.includes(triggerIds, currentUserId)) {
          transformedState.isSelf = true;
        }
      }
      const keyPairs = [
        [GROUP_STATE_KEY.GROUP_POST_CURSOR, GROUP_KEY.POST_CURSOR],
        [GROUP_STATE_KEY.GROUP_POST_DRP_CURSOR, GROUP_KEY.POST_DRP_CURSOR],
        [GROUP_STATE_KEY.LAST_AUTHOR_ID, GROUP_KEY.LAST_AUTHOR_ID],
        [
          GROUP_STATE_KEY.TEAM_MENTION_CURSOR_OFFSET,
          GROUP_KEY.TEAM_MENTION_CURSOR_OFFSET,
        ],
        [
          GROUP_STATE_KEY.GROUP_TEAM_MENTION_CURSOR,
          GROUP_KEY.TEAM_MENTION_CURSOR,
        ],
        [
          GROUP_STATE_KEY.REMOVED_CURSORS_TEAM_MENTION,
          GROUP_KEY.REMOVED_CURSORS_TEAM_MENTION,
        ],
        [
          GROUP_STATE_KEY.ADMIN_MENTION_CURSOR_OFFSET,
          GROUP_KEY.ADMIN_MENTION_CURSOR_OFFSET,
        ],
        [
          GROUP_STATE_KEY.GROUP_ADMIN_MENTION_CURSOR,
          GROUP_KEY.ADMIN_MENTION_CURSOR,
        ],
        [
          GROUP_STATE_KEY.REMOVED_CURSORS_ADMIN_MENTION,
          GROUP_KEY.REMOVED_CURSORS_ADMIN_MENTION,
        ],
      ].filter(([, groupKey]) =>
        Object.prototype.hasOwnProperty.call(group, groupKey),
      );
      keyPairs.forEach(([stateKey, groupKey]) => {
        groupState[stateKey] = group[groupKey];
      });
      const hasValidData = !!keyPairs.length;

      if (hasValidData) {
        if (transformedState.groupStates[groupId]) {
          _.merge(transformedState.groupStates[groupId], groupState);
        } else {
          transformedState.groupStates[groupId] = groupState;
        }
      }
    });
  }

  private _transformStateData(
    states: Partial<State>[],
    transformedState: TransformedState,
  ): void {
    const myState: Partial<State> = {};
    const groupIds = new Set<string>();
    states.forEach((state: Partial<State>) => {
      Object.keys(state).forEach((key: string) => {
        if (key.includes('unread_count')) {
          return;
        }
        if (key === '_id') {
          myState.id = state[key];
          return;
        }
        const matches = key.match(STATE_REGEXP);
        if (matches) {
          const groupStateKey = matches[1];
          const groupId = matches[2];
          const value = state[key];
          if (!transformedState.groupStates[groupId]) {
            transformedState.groupStates[groupId] = {
              id: Number(groupId),
            };
          }
          transformedState.groupStates[groupId][groupStateKey] = value;
          groupIds.add(groupId);
          return;
        }
        myState[key] = state[key];
      });
    });
    if (myState.id !== undefined && myState.id > 0) {
      transformedState.myState = myState as State;
    }
  }

  private async _generateUpdatedState(
    transformedState: TransformedState,
  ): Promise<TransformedState> {
    const updatedState: TransformedState = {
      groupStates: {},
      myState: transformedState.myState,
    };

    const ids: number[] = Object.keys(transformedState.groupStates).map(Number);
    if (ids.length > 0) {
      const localStates = await this._fixOldStatesData(
        (await this._entitySourceController.getEntitiesLocally(ids, false)) ||
          [],
      );

      const localStatesMap = new Map(
        localStates.map(state => [state.id, state]),
      );
      const userConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig;
      const currentUserId: number = userConfig.getGlipUserId();
      Object.values(transformedState.groupStates).forEach(
        (groupState: GroupState) => {
          let stateChanged: boolean = false;
          const localGroupState = localStatesMap.get(groupState.id);
          if (localGroupState) {
            if (
              !transformedState.ignoreCursorValidate &&
              this._hasInvalidCursor(groupState, localGroupState)
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
            resultGroupState.unread_count &&
              mainLogger
                .tags(LOG_TAG)
                .info(
                  `UMI:${resultGroupState.unread_count}->${updateUnread}, id:${
                    groupState.id
                  }, lastPoster:${resultGroupState.last_author_id}, mark:${
                    resultGroupState.marked_as_unread
                  }, G:${resultGroupState.group_post_cursor}, D:${
                    resultGroupState.group_post_drp_cursor
                  }, S:${resultGroupState.post_cursor}`,
                );
            resultGroupState.unread_count = updateUnread;
            stateChanged = true;
          }
          const updateTeamMentionUnread = this._calculateTeamMentionUnread(
            resultGroupState,
            transformedState.isSelf || false,
            currentUserId,
          );
          if (
            updateTeamMentionUnread !==
            resultGroupState.unread_team_mentions_count
          ) {
            resultGroupState.unread_team_mentions_count &&
              mainLogger
                .tags(LOG_TAG)
                .info(
                  `T_UMI:${
                    resultGroupState.unread_team_mentions_count
                  }->${updateTeamMentionUnread}, id:${groupState.id}, G:${
                    resultGroupState.group_team_mention_cursor
                  }, S:${resultGroupState.team_mention_cursor}`,
                );
            resultGroupState.unread_team_mentions_count = updateTeamMentionUnread;
            stateChanged = true;
          }

          if (stateChanged) {
            if (updatedState.groupStates[groupState.id]) {
              _.merge(
                updatedState.groupStates[groupState.id],
                resultGroupState,
              );
            } else {
              updatedState.groupStates[groupState.id] = resultGroupState;
            }
          }
        },
      );
    }
    return updatedState;
  }

  private _hasInvalidCursor(
    updateState: GroupState,
    localState: GroupState,
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
        return true;
      }
    } else if (updateState.group_post_cursor !== undefined) {
      if (updateState.group_post_cursor < (localState.group_post_cursor || 0)) {
        return true;
      }
    } else if (updateState.group_post_drp_cursor !== undefined) {
      if (
        updateState.group_post_drp_cursor <
        (localState.group_post_drp_cursor || 0)
      ) {
        return true;
      }
    }
    if (
      updateState.post_cursor !== undefined &&
      updateState.post_cursor < (localState.post_cursor || 0) &&
      !updateState.marked_as_unread
    ) {
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
      return true;
    }
    if (
      updateState.group_post_cursor !== undefined &&
      updateState.group_post_cursor !== localState.group_post_cursor
    ) {
      return true;
    }
    if (
      updateState.group_post_drp_cursor !== undefined &&
      updateState.group_post_drp_cursor !== localState.group_post_drp_cursor
    ) {
      return true;
    }
    if (
      updateState.post_cursor !== undefined &&
      updateState.post_cursor !== localState.post_cursor
    ) {
      return true;
    }
    if (
      updateState.read_through !== undefined &&
      updateState.read_through > (localState.read_through || 0)
    ) {
      return true;
    }
    return this._containStateUpdate(updateState, localState, [
      'unread_deactivated_count',
      'unread_mentions_count',
      'marked_as_unread',
      'last_author_id',
      'team_mention_cursor',
      'team_mention_cursor_offset',
      'group_team_mention_cursor',
      'removed_cursors_team_mention',
    ]);
  }

  private _containStateUpdate<T extends object, K extends keyof T>(
    updateObj: T,
    targetObj: T,
    keys: K[],
  ) {
    for (const key of keys) {
      if (
        updateObj[key] !== undefined &&
        !_.isEqual(updateObj[key], targetObj[key])
      ) {
        return true;
      }
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

  private _calculateTeamMentionUnread(
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
    const {
      team_mention_cursor = 0,
      group_team_mention_cursor = 0,
      team_mention_cursor_offset = 0,
      removed_cursors_team_mention = [],
    } = finalState;
    const offset = Math.max(team_mention_cursor_offset, team_mention_cursor);
    const removedUnreadCount = removed_cursors_team_mention.filter(index =>
      index > offset ? 1 : 0,
    ).length;
    const unreadTeamMentionCount =
      group_team_mention_cursor - offset - removedUnreadCount;
    return unreadTeamMentionCount;
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
        const config = ServiceLoader.getInstance<StateService>(
          ServiceConfig.STATE_SERVICE,
        ).myStateConfig;
        config.setMyStateId(myState.id);
      } catch (err) {
        mainLogger.error(`StateDataHandleController, my state error, ${err}`);
      }
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
    }

    const groupStates = Object.values(transformedState.groupStates);
    if (groupStates.length > 0) {
      // never remove the await!!! sequence problem!!!
      await this._entitySourceController.bulkUpdate(groupStates);

      // should set umi = 0 when conversation is ignored
      const GroupStatesForNotify = groupStates.filter(
        (groupState: GroupState) => {
          if (this._ignoredIdSet.has(groupState.id)) {
            groupState.unread_count &&
              this._actionController.updateReadStatus(
                groupState.id,
                false,
                true,
              );
            return false;
          }
          return true;
        },
      );

      if (shouldEmitNotification(source)) {
        if (changeMap) {
          changeMap.set(ENTITY.GROUP_STATE, {
            entities: GroupStatesForNotify,
            partials: GroupStatesForNotify,
          });
        } else {
          notificationCenter.emitEntityUpdate(
            ENTITY.GROUP_STATE,
            GroupStatesForNotify,
            GroupStatesForNotify,
          );
        }
      }
    }
  }

  // todo remove it after db upgrade
  private async _fixOldStatesData(
    localStates: GroupState[],
  ): Promise<GroupState[]> {
    const fixKeyPairs = [
      [
        GROUP_STATE_KEY.TEAM_MENTION_CURSOR_OFFSET,
        GROUP_KEY.TEAM_MENTION_CURSOR_OFFSET,
      ],
      [
        GROUP_STATE_KEY.GROUP_TEAM_MENTION_CURSOR,
        GROUP_KEY.TEAM_MENTION_CURSOR,
      ],
      [
        GROUP_STATE_KEY.REMOVED_CURSORS_TEAM_MENTION,
        GROUP_KEY.REMOVED_CURSORS_TEAM_MENTION,
      ],
    ];
    const needFix = (localState: GroupState) =>
      !Object.prototype.hasOwnProperty.call(
        localState,
        GROUP_STATE_KEY.GROUP_TEAM_MENTION_CURSOR,
      ) ||
      (localState.group_team_mention_cursor &&
        localState.group_team_mention_cursor < 0) ||
      (localState.unread_team_mentions_count &&
        localState.unread_team_mentions_count < 0);
    return localStates.map(localState => {
      if (
        needFix(localState) &&
        this._groupService.getSynchronously(localState.id)
      ) {
        const group = this._groupService.getSynchronously(localState.id)!;
        group[GROUP_KEY.TEAM_MENTION_CURSOR] &&
          mainLogger
            .tags('[FIX-TEAM-UMI]')
            .info(
              `fix groupState:${localState.id} cursor from ${
                localState.group_team_mention_cursor
              } => ${group[GROUP_KEY.TEAM_MENTION_CURSOR]}`,
            );
        fixKeyPairs.forEach(([stateKey, groupKey]) => {
          if (Object.prototype.hasOwnProperty.call(group, groupKey)) {
            localState[stateKey] = group![groupKey];
          }
        });
      }
      return localState;
    });
  }
}

export { StateDataHandleController };
