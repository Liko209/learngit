/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-29 10:30:42
 * Copyright © RingCentral. All rights reserved.
 */

import { GROUP_SECTION_TYPE } from '../../constants';
import { SectionUnread } from '../../types';
import { Group } from '../../../group/entity';
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

class TotalUnreadController {
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

  async updateTotalUnreadByStateChanges(
    groupStates: GroupState[],
  ): Promise<void> {
    if (!this._unreadInitialized) {
      await this._initializeTotalUnread();
    } else {
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
    this._doNotification();
  }

  async updateTotalUnreadByGroupChanges(
    payload: NotificationEntityPayload<Group>,
  ): Promise<void> {
    if (!this._unreadInitialized) {
      await this._initializeTotalUnread();
    } else {
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
    this._doNotification();
  }

  private async _initializeTotalUnread(): Promise<void> {
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
