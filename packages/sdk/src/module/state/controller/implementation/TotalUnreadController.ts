/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-29 10:30:42
 * Copyright © RingCentral. All rights reserved.
 */

import { GROUP_BADGE_TYPE, TASK_DATA_TYPE } from '../../constants';
import {
  GroupBadge,
  GroupStateHandleTask,
  GroupEntityHandleTask,
  ProfileEntityHandleTask,
  INIT_STATUS,
} from '../../types';
import { Group } from '../../../group/entity';
import { Profile } from '../../../profile/entity';
import { GroupState } from '../../entity';
import { IGroupService } from '../../../group/service/IGroupService';
import { ProfileService } from '../../../profile/service/ProfileService';
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';
import { AccountService } from '../../../account/service';
import { NotificationEntityPayload } from '../../../../service/notificationCenter';
import { EVENT_TYPES } from '../../../../service/constants';
import _ from 'lodash';
import { mainLogger } from 'foundation/log';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { BadgeService } from 'sdk/module/badge';
import { UndefinedAble } from 'sdk/types';
import { Badge } from 'sdk/module/badge/entity';

type DataHandleTask =
  | GroupStateHandleTask
  | GroupEntityHandleTask
  | ProfileEntityHandleTask;

const LOG_TAG = 'TotalUnreadController';

class TotalUnreadController {
  private _taskArray: (() => Promise<void>)[];
  private _initStatus: INIT_STATUS;
  private _singleGroupBadges: Map<number, GroupBadge>;
  private _badgeMap: Map<string, GroupBadge>;
  private _favoriteGroupIds: number[];
  private _changedBadges: Set<string>;
  private _initQueue: ((status: boolean) => void)[] = [];
  constructor(
    private _groupService: IGroupService,
    private _entitySourceController: IEntitySourceController<GroupState>,
  ) {
    this.reset();
  }

  async reset() {
    this._singleGroupBadges = new Map<number, GroupBadge>();
    this._badgeMap = new Map<string, GroupBadge>();
    this._badgeMap.set(GROUP_BADGE_TYPE.FAVORITE_TEAM, {
      id: GROUP_BADGE_TYPE.FAVORITE_TEAM,
      unreadCount: 0,
      mentionCount: 0,
    });
    this._badgeMap.set(GROUP_BADGE_TYPE.FAVORITE_DM, {
      id: GROUP_BADGE_TYPE.FAVORITE_DM,
      unreadCount: 0,
      mentionCount: 0,
    });
    this._badgeMap.set(GROUP_BADGE_TYPE.DIRECT_MESSAGE, {
      id: GROUP_BADGE_TYPE.DIRECT_MESSAGE,
      unreadCount: 0,
      mentionCount: 0,
    });
    this._badgeMap.set(GROUP_BADGE_TYPE.TEAM, {
      id: GROUP_BADGE_TYPE.TEAM,
      unreadCount: 0,
      mentionCount: 0,
    });
    this._changedBadges = new Set();
    this._taskArray = [];
    this._favoriteGroupIds = [];
    this._initStatus = INIT_STATUS.IDLE;
  }

  getSingleGroupBadge(id: number): UndefinedAble<GroupBadge> {
    return this._singleGroupBadges.get(id);
  }

  handleGroupState(
    payload: NotificationEntityPayload<GroupState>,
  ): Promise<void> {
    const task: DataHandleTask = {
      type: TASK_DATA_TYPE.GROUP_STATE,
      data: payload,
    };
    return this._appendTask(task);
  }

  handleGroup(groups: Group[]): Promise<void> {
    const task: DataHandleTask = {
      type: TASK_DATA_TYPE.GROUP_ENTITY,
      data: groups,
    };
    return this._appendTask(task);
  }

  handleProfile(payload: NotificationEntityPayload<Profile>): Promise<void> {
    const task: DataHandleTask = {
      type: TASK_DATA_TYPE.PROFILE_ENTITY,
      data: payload,
    };
    return this._appendTask(task);
  }

  private async _appendTask(task: DataHandleTask) {
    // should append task and keep promise
    return new Promise<void>(resolve => {
      this._taskArray.push(async () => {
        await this._startDataHandleTask(task);
        resolve();
      });
      if (this._taskArray.length === 1) {
        this._taskArray[0]();
      }
    });
  }

  private async _startDataHandleTask(task: DataHandleTask): Promise<void> {
    try {
      if (!(await this.initializeTotalUnread())) {
        return;
      }
      this._changedBadges.clear();
      if (task.type === TASK_DATA_TYPE.GROUP_STATE) {
        await this._updateTotalUnreadByStateChanges(task.data);
      } else if (task.type === TASK_DATA_TYPE.GROUP_ENTITY) {
        await this._updateTotalUnreadByGroupChanges(task.data);
      } else {
        await this._updateTotalUnreadByProfileChanges(task.data);
      }
      this._updateBadge();
    } catch (err) {
      mainLogger.error(`TotalUnreadController, handle task error, ${err}`);
    }

    this._taskArray.shift();
    if (this._taskArray.length > 0) {
      this._taskArray[0]();
    }
  }

  private async _updateTotalUnreadByStateChanges(
    payload: NotificationEntityPayload<GroupState>,
  ): Promise<void> {
    if (payload.type === EVENT_TYPES.UPDATE) {
      payload.body.entities.forEach((groupState: GroupState) => {
        const groupUnread = this._singleGroupBadges.get(groupState.id);
        if (groupUnread) {
          this._updateToTotalUnread(groupUnread, groupState);
          groupUnread.unreadCount = groupState.unread_count || 0;
          groupUnread.mentionCount = this._getMentionUnread(groupState);
        }
      });
    }
  }

  private async _updateTotalUnreadByGroupChanges(
    groups: Group[],
  ): Promise<void> {
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const glipId = userConfig.getGlipUserId();
    const groupsMap = new Map<number, Group>();
    groups.forEach((group: Group) => {
      const groupUnread = this._singleGroupBadges.get(group.id);
      if (
        !this._groupService.isValid(group) ||
        !group.members.includes(glipId)
      ) {
        if (groupUnread) {
          this._deleteFromTotalUnread(groupUnread);
          this._singleGroupBadges.delete(group.id);
        }
      } else if (!groupUnread) {
        groupsMap.set(group.id, group);
      }
    });
    if (groupsMap.size) {
      await this._addNewGroupsUnread(groupsMap);
    }
  }

  private async _updateTotalUnreadByProfileChanges(
    payload: NotificationEntityPayload<Profile>,
  ): Promise<void> {
    if (payload.type === EVENT_TYPES.UPDATE) {
      payload.body.ids.forEach((id: number) => {
        const profile = payload.body.entities.get(id);
        if (!profile) {
          return;
        }
        const newFavoriteIds = profile.favorite_group_ids || [];
        const adds = _.difference(newFavoriteIds, this._favoriteGroupIds);
        this._updateTotalUnreadByFavoriteChanges(adds, true);
        const removes = _.difference(this._favoriteGroupIds, newFavoriteIds);
        this._updateTotalUnreadByFavoriteChanges(removes, false);
        this._favoriteGroupIds = newFavoriteIds;
      });
    }
  }

  private _updateTotalUnreadByFavoriteChanges(
    ids: number[],
    isAdd: boolean,
  ): void {
    ids.forEach((id: number) => {
      const groupUnread = this._singleGroupBadges.get(id);
      if (!groupUnread) {
        return;
      }
      if (isAdd) {
        this._moveSingleUnread(
          groupUnread,
          groupUnread.isTeam
            ? GROUP_BADGE_TYPE.FAVORITE_TEAM
            : GROUP_BADGE_TYPE.FAVORITE_DM,
        );
      } else {
        this._moveSingleUnread(
          groupUnread,
          groupUnread.isTeam
            ? GROUP_BADGE_TYPE.TEAM
            : GROUP_BADGE_TYPE.DIRECT_MESSAGE,
        );
      }
    });
  }

  private _moveSingleUnread(groupUnread: GroupBadge, to: string) {
    if (groupUnread.id === to) {
      return;
    }
    if (groupUnread.unreadCount) {
      this._deleteFromTotalUnread(groupUnread);
      this._modifyTotalUnread(
        to,
        groupUnread.unreadCount,
        groupUnread.mentionCount,
      );
    }
    groupUnread.id = to;
  }

  async initializeTotalUnread(): Promise<boolean> {
    if (this._initStatus === INIT_STATUS.INITIALIZED) {
      return true;
    }

    if (this._initStatus === INIT_STATUS.INITIALIZING) {
      return new Promise<boolean>(resolve => {
        this._initQueue.push(resolve);
      });
    }

    let result = false;
    try {
      this.reset();
      this._initStatus = INIT_STATUS.INITIALIZING;

      const profileService = ServiceLoader.getInstance<ProfileService>(
        ServiceConfig.PROFILE_SERVICE,
      );
      const groups = await this._groupService.getEntities();
      this._favoriteGroupIds =
        (await profileService.getFavoriteGroupIds()) || [];
      const userConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig;
      const glipId = userConfig.getGlipUserId();

      const groupsMap = new Map<number, Group>();
      groups.forEach((group: Group) => {
        if (
          this._groupService.isValid(group) &&
          group.members.includes(glipId)
        ) {
          groupsMap.set(group.id, group);
        }
      });
      await this._addNewGroupsUnread(groupsMap);
      this._registerBadge();
      this._updateBadge();
      this._initStatus = INIT_STATUS.INITIALIZED;
      result = true;
    } catch (err) {
      mainLogger.error(`TotalUnreadController, init error, ${err}`);
      this._initStatus = INIT_STATUS.IDLE;
    }
    this._initQueue.forEach(resolve => {
      resolve(result);
    });
    this._initQueue = [];
    return result;
  }

  private async _addNewGroupsUnread(groupsMap: Map<number, Group>) {
    const groupStates = await this._entitySourceController.batchGet(
      Array.from(groupsMap.keys()),
    );
    const statesMap = new Map<number, GroupState>(
      groupStates.map(state => [state.id, state]),
    );

    groupsMap.forEach((group: Group) => {
      const state = statesMap.get(group.id);
      this._addNewGroupUnread(group, state);
    });
  }

  private _addNewGroupUnread(group: Group, groupState?: GroupState) {
    let id: string;
    let unreadCount: number = 0;
    let mentionCount: number = 0;
    if (groupState) {
      unreadCount = groupState.unread_count || 0;
      mentionCount = this._getMentionUnread(groupState);
    }

    if (this._favoriteGroupIds && this._favoriteGroupIds.includes(group.id)) {
      id = group.is_team
        ? GROUP_BADGE_TYPE.FAVORITE_TEAM
        : GROUP_BADGE_TYPE.FAVORITE_DM;
    } else {
      id = group.is_team
        ? GROUP_BADGE_TYPE.TEAM
        : GROUP_BADGE_TYPE.DIRECT_MESSAGE;
    }

    this._singleGroupBadges.set(group.id, {
      id,
      unreadCount,
      mentionCount,
      isTeam: group.is_team,
    });

    if (unreadCount) {
      this._modifyTotalUnread(id, unreadCount, mentionCount);
    }
  }

  private _deleteFromTotalUnread(groupUnread: GroupBadge): void {
    if (groupUnread.unreadCount) {
      this._modifyTotalUnread(
        groupUnread.id,
        -groupUnread.unreadCount,
        -groupUnread.mentionCount,
      );
    }
  }

  private _updateToTotalUnread(
    groupUnread: GroupBadge,
    groupState: GroupState,
  ): void {
    let unreadUpdate = 0;
    let mentionUpdate = 0;
    if (groupUnread.unreadCount) {
      if (groupState.unread_count) {
        unreadUpdate = groupState.unread_count - groupUnread.unreadCount;
        mentionUpdate =
          this._getMentionUnread(groupState) - groupUnread.mentionCount;
      } else {
        unreadUpdate = -groupUnread.unreadCount;
        mentionUpdate = -groupUnread.mentionCount;
      }
    } else if (groupState.unread_count) {
      unreadUpdate = groupState.unread_count;
      mentionUpdate = this._getMentionUnread(groupState);
    } else {
      unreadUpdate = 0;
      mentionUpdate = 0;
    }

    this._modifyTotalUnread(groupUnread.id, unreadUpdate, mentionUpdate);
  }

  private _modifyTotalUnread(
    id: string,
    unreadUpdate: number,
    mentionUpdate: number,
  ): void {
    let target = this._badgeMap.get(id);
    if (!target) {
      target = {
        id,
        unreadCount: 0,
        mentionCount: 0,
      };
      this._badgeMap.set(id, target);
    }
    this._changedBadges.add(id);
    target.unreadCount += unreadUpdate;
    target.mentionCount += mentionUpdate;
  }

  private _updateBadge(): void {
    if (this._changedBadges.size === 0) {
      return;
    }
    const badgeService = ServiceLoader.getInstance<BadgeService>(
      ServiceConfig.BADGE_SERVICE,
    );
    this._changedBadges.forEach((id: string) => {
      const badge = this._getBadge(id);
      badgeService.updateBadge(badge);
      mainLogger.tags(LOG_TAG).info('update badge: ', badge);
    });
  }

  private _getBadge(id: string): Badge {
    const badge = this._badgeMap.get(id);
    if (!badge) {
      return { id, unreadCount: 0 };
    }
    return badge;
  }

  private _registerBadge() {
    const badgeService = ServiceLoader.getInstance<BadgeService>(
      ServiceConfig.BADGE_SERVICE,
    );
    badgeService.registerBadge(GROUP_BADGE_TYPE.DIRECT_MESSAGE, () => {
      return this._getBadge(GROUP_BADGE_TYPE.DIRECT_MESSAGE);
    });
    badgeService.registerBadge(GROUP_BADGE_TYPE.TEAM, () => {
      return this._getBadge(GROUP_BADGE_TYPE.TEAM);
    });
    badgeService.registerBadge(GROUP_BADGE_TYPE.FAVORITE_DM, () => {
      return this._getBadge(GROUP_BADGE_TYPE.FAVORITE_DM);
    });
    badgeService.registerBadge(GROUP_BADGE_TYPE.FAVORITE_TEAM, () => {
      return this._getBadge(GROUP_BADGE_TYPE.FAVORITE_TEAM);
    });
  }

  private _getMentionUnread(groupState: GroupState) {
    const {
      unread_mentions_count = 0,
      unread_team_mentions_count = 0,
    } = groupState;
    return unread_mentions_count + Math.max(unread_team_mentions_count, 0);
  }
}

export { TotalUnreadController };
