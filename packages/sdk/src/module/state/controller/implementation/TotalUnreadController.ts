/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-29 10:30:42
 * Copyright © RingCentral. All rights reserved.
 */

import { UMI_SECTION_TYPE, TASK_DATA_TYPE } from '../../constants';
import {
  SectionUnread,
  GroupStateHandleTask,
  GroupEntityHandleTask,
  ProfileEntityHandleTask,
} from '../../types';
import { Group } from '../../../group/entity';
import { Profile } from '../../../profile/entity';
import { GroupState } from '../../entity';
import { IGroupService } from '../../../group/service/IGroupService';
import { ProfileService } from '../../../profile/service/ProfileService';
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';
import { AccountUserConfig } from '../../../../module/account/config';
import notificationCenter, {
  NotificationEntityPayload,
} from '../../../../service/notificationCenter';
import { EVENT_TYPES } from '../../../../service/constants';
import { SERVICE } from '../../../../service/eventKey';
import _ from 'lodash';
import { mainLogger } from 'foundation';

type DataHandleTask =
  | GroupStateHandleTask
  | GroupEntityHandleTask
  | ProfileEntityHandleTask;

class TotalUnreadController {
  private _taskArray: DataHandleTask[];
  private _unreadInitialized: boolean;
  private _groupSectionUnread: Map<number, SectionUnread>;
  private _totalUnreadMap: Map<UMI_SECTION_TYPE, SectionUnread>;
  private _favoriteGroupIds: number[];
  constructor(
    private _groupService: IGroupService,
    private _entitySourceController: IEntitySourceController<GroupState>,
  ) {
    this._taskArray = [];
    this._unreadInitialized = false;
    this._favoriteGroupIds = [];
    this.reset();
  }

  async reset() {
    this._groupSectionUnread = new Map<number, SectionUnread>();
    this._totalUnreadMap = new Map<UMI_SECTION_TYPE, SectionUnread>();
    this._totalUnreadMap.set(UMI_SECTION_TYPE.ALL, {
      section: UMI_SECTION_TYPE.ALL,
      unreadCount: 0,
      mentionCount: 0,
    });
    this._totalUnreadMap.set(UMI_SECTION_TYPE.FAVORITE, {
      section: UMI_SECTION_TYPE.FAVORITE,
      unreadCount: 0,
      mentionCount: 0,
    });
    this._totalUnreadMap.set(UMI_SECTION_TYPE.DIRECT_MESSAGE, {
      section: UMI_SECTION_TYPE.DIRECT_MESSAGE,
      unreadCount: 0,
      mentionCount: 0,
    });
    this._totalUnreadMap.set(UMI_SECTION_TYPE.TEAM, {
      section: UMI_SECTION_TYPE.TEAM,
      unreadCount: 0,
      mentionCount: 0,
    });
  }

  getSingleUnreadInfo(id: number): SectionUnread | undefined {
    return this._groupSectionUnread.get(id);
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
    try {
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
    } catch (err) {
      mainLogger.error(`TotalUnreadController, handle task error, ${err}`);
    }

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
        this._updateToTotalUnread(groupUnread, groupState);
        groupUnread.unreadCount = groupState.unread_count || 0;
        groupUnread.mentionCount = groupState.unread_mentions_count || 0;
      }
    });
  }

  private async _updateTotalUnreadByGroupChanges(
    payload: NotificationEntityPayload<Group>,
  ): Promise<void> {
    if (payload.type === EVENT_TYPES.UPDATE) {
      const userConfig = new AccountUserConfig();
      const glipId = userConfig.getGlipUserId();
      await Promise.all(
        payload.body.ids.map(async (id: number) => {
          const group = payload.body.entities.get(id);
          if (!group) {
            return;
          }
          const groupUnread = this._groupSectionUnread.get(id);
          if (
            !this._groupService.isValid(group) ||
            !group.members.includes(glipId)
          ) {
            if (groupUnread) {
              this._deleteFromTotalUnread(groupUnread);
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
      const groupUnread = this._groupSectionUnread.get(id);
      if (!groupUnread) {
        return;
      }
      if (isAdd) {
        if (groupUnread.section !== UMI_SECTION_TYPE.FAVORITE) {
          this._deleteFromTotalUnread(groupUnread);
          if (groupUnread.isTeam) {
            this._modifyTotalUnread(
              UMI_SECTION_TYPE.FAVORITE,
              groupUnread.unreadCount > 0 ? groupUnread.mentionCount : 0,
              groupUnread.mentionCount,
            );
          } else {
            this._modifyTotalUnread(
              UMI_SECTION_TYPE.FAVORITE,
              groupUnread.unreadCount,
              groupUnread.mentionCount,
            );
          }
          groupUnread.section = UMI_SECTION_TYPE.FAVORITE;
        }
      } else {
        if (groupUnread.section === UMI_SECTION_TYPE.FAVORITE) {
          this._deleteFromTotalUnread(groupUnread);
          if (!groupUnread.isTeam) {
            this._modifyTotalUnread(
              UMI_SECTION_TYPE.DIRECT_MESSAGE,
              groupUnread.unreadCount,
              groupUnread.mentionCount,
            );
            groupUnread.section = UMI_SECTION_TYPE.DIRECT_MESSAGE;
          } else {
            this._modifyTotalUnread(
              UMI_SECTION_TYPE.TEAM,
              groupUnread.unreadCount > 0 ? groupUnread.mentionCount : 0,
              groupUnread.mentionCount,
            );
            groupUnread.section = UMI_SECTION_TYPE.TEAM;
          }
        }
      }
    });
  }

  private async _initializeTotalUnread(): Promise<void> {
    this.reset();

    const profileService: ProfileService = ProfileService.getInstance();
    const groups = await this._groupService.getEntities();
    this._favoriteGroupIds = (await profileService.getFavoriteGroupIds()) || [];
    const userConfig = new AccountUserConfig();
    const glipId = userConfig.getGlipUserId();

    await Promise.all(
      groups.map(async (group: Group) => {
        if (
          !this._groupService.isValid(group) ||
          !group.members.includes(glipId)
        ) {
          return;
        }
        await this._addNewGroupUnread(group);
      }),
    );

    this._unreadInitialized = true;
  }

  private async _addNewGroupUnread(group: Group): Promise<void> {
    let section: UMI_SECTION_TYPE;
    let unreadCount: number = 0;
    let mentionCount: number = 0;

    const groupState = await this._entitySourceController.get(group.id);
    if (groupState) {
      unreadCount = groupState.unread_count || 0;
      mentionCount = groupState.unread_mentions_count || 0;
    }

    if (this._favoriteGroupIds && this._favoriteGroupIds.includes(group.id)) {
      section = UMI_SECTION_TYPE.FAVORITE;
    } else if (!group.is_team) {
      section = UMI_SECTION_TYPE.DIRECT_MESSAGE;
    } else {
      section = UMI_SECTION_TYPE.TEAM;
    }

    this._groupSectionUnread.set(group.id, {
      section,
      unreadCount,
      mentionCount,
      isTeam: group.is_team,
    });

    if (group.is_team && unreadCount > 0) {
      unreadCount = mentionCount;
    }
    this._modifyTotalUnread(section, unreadCount, mentionCount);
  }

  private _deleteFromTotalUnread(groupUnread: SectionUnread): void {
    let unreadUpdate = -groupUnread.unreadCount;
    if (groupUnread.isTeam) {
      if (groupUnread.unreadCount === 0) {
        unreadUpdate = 0;
      } else {
        unreadUpdate = -groupUnread.mentionCount;
      }
    }

    this._modifyTotalUnread(
      groupUnread.section,
      unreadUpdate,
      -groupUnread.mentionCount,
    );
  }

  private _updateToTotalUnread(
    groupUnread: SectionUnread,
    groupState: GroupState,
  ): void {
    let unreadUpdate = (groupState.unread_count || 0) - groupUnread.unreadCount;
    if (groupUnread.isTeam) {
      if (groupUnread.unreadCount === 0) {
        if ((groupState.unread_count || 0) > 0) {
          unreadUpdate = groupState.unread_mentions_count || 0;
        } else {
          unreadUpdate = 0;
        }
      } else {
        if ((groupState.unread_count || 0) === 0) {
          unreadUpdate = -groupUnread.mentionCount;
        } else {
          unreadUpdate =
            (groupState.unread_mentions_count || 0) - groupUnread.mentionCount;
        }
      }
    }

    this._modifyTotalUnread(
      groupUnread.section,
      unreadUpdate,
      (groupState.unread_mentions_count || 0) - groupUnread.mentionCount,
    );
  }

  private _modifyTotalUnread(
    section: UMI_SECTION_TYPE,
    unreadUpdate: number,
    mentionUpdate: number,
  ): void {
    let target = this._totalUnreadMap.get(section);
    if (!target) {
      target = {
        section,
        unreadCount: 0,
        mentionCount: 0,
      };
      this._totalUnreadMap.set(section, target);
    }
    let totalUnread = this._totalUnreadMap.get(UMI_SECTION_TYPE.ALL);
    if (!totalUnread) {
      totalUnread = {
        section: UMI_SECTION_TYPE.ALL,
        unreadCount: 0,
        mentionCount: 0,
      };
      this._totalUnreadMap.set(UMI_SECTION_TYPE.ALL, totalUnread);
    }
    target.unreadCount += unreadUpdate;
    target.mentionCount += mentionUpdate;
    totalUnread.unreadCount += unreadUpdate;
    totalUnread.mentionCount += mentionUpdate;
  }

  private _doNotification(): void {
    notificationCenter.emit(SERVICE.TOTAL_UNREAD, this._totalUnreadMap);
  }
}

export { TotalUnreadController };
