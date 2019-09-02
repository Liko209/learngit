/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 19:01:54
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { container } from 'framework/ioc';
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity } from '@/store/utils';
import {
  UmiProps,
  UmiViewProps,
  UMI_SECTION_TYPE,
  UnreadCounts,
} from './types';
import GroupStateModel from '@/store/models/GroupState';
import GroupModel from '@/store/models/Group';
import { ENTITY_NAME } from '@/store';
import { AppStore } from '@/modules/app/store';
import { GROUP_BADGE_TYPE } from 'sdk/module/state';
import BadgeModel from '@/store/models/Badge';
import { NEW_MESSAGE_BADGES_OPTIONS } from 'sdk/module/profile/constants';
import { MESSAGE_SETTING_ITEM } from '@/modules/message/interface';
import SettingModel from '@/store/models/UserSetting';
import { UserSettingEntity } from 'sdk/src/module/setting';

class UmiViewModel extends StoreViewModel<UmiProps> implements UmiViewProps {
  private _appStore = container.get(AppStore);

  constructor(props: UmiProps) {
    super(props);

    if (props.global) {
      this.autorun(() => this.updateAppUmi());
    }
  }

  @computed
  private get _unreadInfo() {
    let unreadInfo = {
      unreadCount: 0,
      important: false,
    };

    if (this.props.type === UMI_SECTION_TYPE.SINGLE) {
      unreadInfo = this._getSingleUnreadInfo();
    } else {
      unreadInfo = this._getSectionUnreadInfo();
    }

    return unreadInfo;
  }

  private get _onlyIncludeTeamMention() {
    return (
      this._currentBadgeSetting.value ===
      NEW_MESSAGE_BADGES_OPTIONS.GROUPS_AND_MENTIONS
    );
  }

  private get _currentBadgeSetting() {
    return getEntity<
      UserSettingEntity,
      SettingModel<NEW_MESSAGE_BADGES_OPTIONS>
    >(ENTITY_NAME.USER_SETTING, MESSAGE_SETTING_ITEM.NEW_MESSAGE_BADGE_COUNT);
  }

  private _getSingleUnreadInfo() {
    if (!this.props.id || this._currentBadgeSetting.isMocked) {
      return { unreadCount: 0, important: false };
    }

    const groupState: GroupStateModel = getEntity(
      ENTITY_NAME.GROUP_STATE,
      this.props.id,
    );
    const group: GroupModel = getEntity(ENTITY_NAME.GROUP, this.props.id);
    const totalUnreadMentionCount =
      (groupState.unreadMentionsCount || 0) +
      Math.max(0, groupState.unreadTeamMentionsCount || 0);
    const unreadCount =
      (group.isTeam && this._onlyIncludeTeamMention
        ? totalUnreadMentionCount
        : groupState.unreadCount) || 0;
    return {
      unreadCount,
      important: unreadCount ? !!totalUnreadMentionCount : false,
    };
  }

  private _getSectionUnreadInfo() {
    let counts: UnreadCounts = {
      unreadCount: 0,
      mentionCount: 0,
    };

    switch (this.props.type) {
      case UMI_SECTION_TYPE.ALL: {
        counts = this._getMergedUnreadCounts([
          GROUP_BADGE_TYPE.TEAM,
          GROUP_BADGE_TYPE.DIRECT_MESSAGE,
          GROUP_BADGE_TYPE.FAVORITE_DM,
          GROUP_BADGE_TYPE.FAVORITE_TEAM,
        ]);
        break;
      }
      case UMI_SECTION_TYPE.FAVORITE: {
        counts = this._getMergedUnreadCounts([
          GROUP_BADGE_TYPE.FAVORITE_DM,
          GROUP_BADGE_TYPE.FAVORITE_TEAM,
        ]);
        break;
      }
      case UMI_SECTION_TYPE.DIRECT_MESSAGE: {
        counts = this._getMergedUnreadCounts([GROUP_BADGE_TYPE.DIRECT_MESSAGE]);
        break;
      }
      case UMI_SECTION_TYPE.TEAM: {
        counts = this._getMergedUnreadCounts([GROUP_BADGE_TYPE.TEAM]);
        break;
      }
      default:
        break;
    }

    return {
      unreadCount: counts.unreadCount,
      important: !!counts.mentionCount,
    };
  }

  private _getMergedUnreadCounts(ids: string[]): UnreadCounts {
    const counts: UnreadCounts = { unreadCount: 0, mentionCount: 0 };
    if(this._currentBadgeSetting.isMocked){
      return counts
    }
    ids.forEach((id: string) => {
      const badge: BadgeModel = getEntity(ENTITY_NAME.BADGE, id);
      if (
        (id === GROUP_BADGE_TYPE.TEAM ||
          id === GROUP_BADGE_TYPE.FAVORITE_TEAM) &&
        this._onlyIncludeTeamMention
      ) {
        counts.unreadCount += badge.mentionCount;
      } else {
        counts.unreadCount += badge.unreadCount;
      }
      counts.mentionCount += badge.mentionCount;
    });
    return counts;
  }

  updateAppUmi() {
    this._appStore.setUmi({ message: this.unreadCount });
  }

  @computed
  get unreadCount() {
    return this._unreadInfo.unreadCount;
  }

  @computed
  get important() {
    return this._unreadInfo.important;
  }
}
export { UmiViewModel };
