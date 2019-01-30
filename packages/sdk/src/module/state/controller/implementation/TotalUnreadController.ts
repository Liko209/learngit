/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-29 10:30:42
 * Copyright © RingCentral. All rights reserved.
 */

import { GROUP_SECTION_TYPE, TASK_DATA_TYPE } from '../../constants';
import {
  SectionUnread,
  GroupStateHandleTask,
  GroupEntityHandleTask,
  ProfileEntityHandleTask,
} from '../../types';
import { Group } from '../../../group/entity';
import { Profile } from '../../../profile/entity';
import { GroupState } from '../../entity';
import { GroupService as NewGroupService } from '../../../group';
import { GroupService } from '../../../../service/group';
import { ProfileService } from '../../../../service/profile';
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';
import { UserConfig } from '../../../../service/account';
import notificationCenter, {
  NotificationEntityPayload,
} from '../../../../service/notificationCenter';
import { EVENT_TYPES } from '../../../../service/constants';
import { SERVICE } from '../../../../service/eventKey';
import _ from 'lodash';

type DataHandleTask =
  | GroupStateHandleTask
  | GroupEntityHandleTask
  | ProfileEntityHandleTask;

class TotalUnreadController {
  private _taskArray: DataHandleTask[];
  private _unreadInitialized: boolean;
  private _groupSectionUnread: Map<number, SectionUnread>;
  private _totalUnread: SectionUnread;
  private _favoriteUnread: SectionUnread;
  private _directMessageUnread: SectionUnread;
  private _teamUnread: SectionUnread;
  private _favoriteGroupIds: number[];
  constructor(
    private _entitySourceController: IEntitySourceController<GroupState>,
  ) {
    this._unreadInitialized = false;
    this.reset();
  }

  async reset() {
    this._taskArray = [];
    this._groupSectionUnread = new Map<number, SectionUnread>();
    this._totalUnread = {
      section: GROUP_SECTION_TYPE.ALL,
      unreadCount: 0,
      mentionCount: 0,
    };
    this._favoriteUnread = {
      section: GROUP_SECTION_TYPE.FAVORITE,
      unreadCount: 0,
      mentionCount: 0,
    };
    this._directMessageUnread = {
      section: GROUP_SECTION_TYPE.DIRECT_MESSAGE,
      unreadCount: 0,
      mentionCount: 0,
    };
    this._teamUnread = {
      section: GROUP_SECTION_TYPE.TEAM,
      unreadCount: 0,
      mentionCount: 0,
    };
  }

  handleGroupState(groupStates: GroupState[]): void {
    const task: DataHandleTask = {
      type: TASK_DATA_TYPE.GROUP_STATE,
      data: groupStates,
    };
    this._taskArray.push(task);
    if (this._taskArray.length === 1) {
      this._startDataHandleTask(this._taskArray[0]);
    }
  }

  handleGroup(payload: NotificationEntityPayload<Group>): void {
    const task: DataHandleTask = {
      type: TASK_DATA_TYPE.GROUP_ENTITY,
      data: payload,
    };
    this._taskArray.push(task);
    if (this._taskArray.length === 1) {
      this._startDataHandleTask(this._taskArray[0]);
    }
  }

  handleProfile(payload: NotificationEntityPayload<Profile>): void {
    const task: DataHandleTask = {
      type: TASK_DATA_TYPE.PROFILE_ENTITY,
      data: payload,
    };
    this._taskArray.push(task);
    if (this._taskArray.length === 1) {
      this._startDataHandleTask(this._taskArray[0]);
    }
  }

  private async _startDataHandleTask(task: DataHandleTask): Promise<void> {
    if (!this._unreadInitialized) {
      await this._initializeTotalUnread();
    } else {
      if (task.type === TASK_DATA_TYPE.GROUP_STATE) {
        await this._updateTotalUnreadByStateChanges(task.data);
      } else if (task.type === TASK_DATA_TYPE.GROUP_ENTITY) {
        await this._updateTotalUnreadByGroupChanges(task.data);
      } else {
        await this._updateTotalUnreadByProfileChanges(task.data);
      }
    }
    this._doNotification();

    this._taskArray.shift();
    if (this._taskArray.length > 0) {
      this._startDataHandleTask(this._taskArray[0]);
    }
  }

  private async _updateTotalUnreadByStateChanges(
    groupStates: GroupState[],
  ): Promise<void> {
    groupStates.forEach((groupState: GroupState) => {
      const groupUnread = this._groupSectionUnread.get(groupState.id);
      if (groupUnread) {
        this._updateTotalUnread(
          groupUnread.section,
          (groupState.unread_count || 0) - groupUnread.unreadCount,
          (groupState.unread_mentions_count || 0) - groupUnread.mentionCount,
        );
        groupUnread.unreadCount = groupState.unread_count || 0;
        groupUnread.mentionCount = groupState.unread_mentions_count || 0;
      }
    });
  }

  private async _updateTotalUnreadByGroupChanges(
    payload: NotificationEntityPayload<Group>,
  ): Promise<void> {
    if (payload.type === EVENT_TYPES.DELETE) {
      payload.body.ids.forEach((id: number) => {
        const groupUnread = this._groupSectionUnread.get(id);
        if (groupUnread) {
          this._updateTotalUnread(
            groupUnread.section,
            -groupUnread.unreadCount,
            -groupUnread.mentionCount,
          );
          this._groupSectionUnread.delete(id);
        }
      });
    } else if (payload.type === EVENT_TYPES.UPDATE) {
      const currentUserId = UserConfig.getCurrentUserId();
      await Promise.all(
        payload.body.ids.map(async (id: number) => {
          const group = payload.body.entities.get(id);
          if (!group) {
            return;
          }
          const groupUnread = this._groupSectionUnread.get(id);
          if (
            group.deactivated ||
            true === group.is_archived ||
            !group.members.includes(currentUserId)
          ) {
            if (groupUnread) {
              this._updateTotalUnread(
                groupUnread.section,
                -groupUnread.unreadCount,
                -groupUnread.mentionCount,
              );
              this._groupSectionUnread.delete(id);
            }
          } else {
            if (!groupUnread) {
              await this._addNewGroupUnread(group);
            }
          }
        }),
      );
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
        const newFavoriteIds = profile.favorite_group_ids;
        const adds = _.difference(newFavoriteIds, this._favoriteGroupIds);
        this._updateTotalUnreadByFavoriteChanges(adds, true);
        const removes = _.difference(this._favoriteGroupIds, newFavoriteIds);
        this._updateTotalUnreadByFavoriteChanges(removes, false);
      });
    }
  }

  private _updateTotalUnreadByFavoriteChanges(
    ids: number[],
    isAdd: boolean,
  ): void {
    ids.forEach((id: number) => {
      const groupUnread = this._groupSectionUnread.get(id);
      if (!groupUnread) {
        return;
      }
      if (isAdd) {
        if (groupUnread.section !== GROUP_SECTION_TYPE.FAVORITE) {
          this._updateTotalUnread(
            groupUnread.section,
            -groupUnread.unreadCount,
            -groupUnread.mentionCount,
          );
          this._updateTotalUnread(
            GROUP_SECTION_TYPE.FAVORITE,
            groupUnread.unreadCount,
            groupUnread.mentionCount,
          );
          groupUnread.section = GROUP_SECTION_TYPE.FAVORITE;
        }
      } else {
        if (groupUnread.section === GROUP_SECTION_TYPE.FAVORITE) {
          this._updateTotalUnread(
            groupUnread.section,
            -groupUnread.unreadCount,
            -groupUnread.mentionCount,
          );
          if (!groupUnread.isTeam) {
            this._updateTotalUnread(
              GROUP_SECTION_TYPE.DIRECT_MESSAGE,
              groupUnread.unreadCount,
              groupUnread.mentionCount,
            );
            groupUnread.section = GROUP_SECTION_TYPE.DIRECT_MESSAGE;
          } else {
            this._updateTotalUnread(
              GROUP_SECTION_TYPE.TEAM,
              groupUnread.unreadCount,
              groupUnread.mentionCount,
            );
            groupUnread.section = GROUP_SECTION_TYPE.TEAM;
          }
        }
      }
    });
  }

  private async _initializeTotalUnread(): Promise<void> {
    this.reset();

    // todo instance
    const newGroupService: NewGroupService = new NewGroupService();
    const groupService: GroupService = GroupService.getInstance();
    // todo get favorite group ids
    const profileService: ProfileService = ProfileService.getInstance();
    const profile = await profileService.getProfile();
    this._favoriteGroupIds =
      profile && profile.favorite_group_ids ? profile.favorite_group_ids : [];
    const groups = await newGroupService.getEntitySource().getEntities();
    await Promise.all(
      groups.map(async (group: Group) => {
        // todo check group is valid
        if (groupService.isValid(group)) {
          return;
        }
        // todo check current user is in group
        const currentUserId = UserConfig.getCurrentUserId();
        if (!group.members.includes(currentUserId)) {
          return;
        }
        await this._addNewGroupUnread(group);
      }),
    );

    this._unreadInitialized = true;
  }

  private async _addNewGroupUnread(group: Group): Promise<void> {
    let section: GROUP_SECTION_TYPE;
    let unreadCount: number = 0;
    let mentionCount: number = 0;

    const groupState = await this._entitySourceController.get(group.id);
    if (groupState) {
      unreadCount = groupState.unread_count || 0;
      mentionCount = groupState.unread_mentions_count || 0;
    }

    if (this._favoriteGroupIds.includes(group.id)) {
      section = GROUP_SECTION_TYPE.FAVORITE;
    } else if (!group.is_team) {
      section = GROUP_SECTION_TYPE.DIRECT_MESSAGE;
    } else {
      section = GROUP_SECTION_TYPE.TEAM;
    }
    this._updateTotalUnread(section, unreadCount, mentionCount);
    this._updateTotalUnread(GROUP_SECTION_TYPE.ALL, unreadCount, mentionCount);

    this._groupSectionUnread.set(group.id, {
      section,
      unreadCount,
      mentionCount,
      isTeam: group.is_team,
    });
  }

  private _updateTotalUnread(
    section: GROUP_SECTION_TYPE,
    unreadUpdate: number,
    mentionUpdate: number,
  ): void {
    let target = undefined;
    switch (section) {
      case GROUP_SECTION_TYPE.FAVORITE: {
        target = this._favoriteUnread;
        break;
      }
      case GROUP_SECTION_TYPE.DIRECT_MESSAGE: {
        target = this._directMessageUnread;
        break;
      }
      case GROUP_SECTION_TYPE.TEAM: {
        target = this._teamUnread;
        break;
      }
      case GROUP_SECTION_TYPE.ALL: {
        target = this._totalUnread;
        break;
      }
    }
    if (target) {
      target.unreadCount += unreadUpdate;
      target.mentionCount += mentionUpdate;
    }
  }

  private _doNotification() {
    notificationCenter.emit(SERVICE.TOTAL_UNREAD, [
      this._totalUnread,
      this._favoriteUnread,
      this._directMessageUnread,
      this._teamUnread,
    ]);
  }
}

export { TotalUnreadController };
