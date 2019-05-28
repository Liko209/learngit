/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 19:01:54
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, untracked } from 'mobx';
import _ from 'lodash';
import { container } from 'framework';
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity, getGlobalValue, getSingleEntity } from '@/store/utils';
import {
  UmiProps,
  UmiViewProps,
  UMI_SECTION_TYPE,
  UnreadCounts,
} from './types';
import GroupStateModel from '@/store/models/GroupState';
import GroupModel from '@/store/models/Group';
import { ENTITY_NAME } from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { AppStore } from '@/modules/app/store';
import { StateService, GROUP_BADGE_TYPE } from 'sdk/module/state';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import BadgeModel from '@/store/models/Badge';
import { NEW_MESSAGE_BADGES_OPTIONS } from 'sdk/module/profile/constants';

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

  private _getSingleUnreadInfo() {
    if (!this.props.id) {
      return { unreadCount: 0, important: false };
    }

    const groupState: GroupStateModel = getEntity(
      ENTITY_NAME.GROUP_STATE,
      this.props.id,
    );
    const group: GroupModel = getEntity(ENTITY_NAME.GROUP, this.props.id);
    const onlyIncludeTeamMention =
      getSingleEntity(ENTITY_NAME.PROFILE, 'newMessageBadges') ===
      NEW_MESSAGE_BADGES_OPTIONS.GROUPS_AND_MENTIONS;

    const unreadCount =
      (group.isTeam && onlyIncludeTeamMention
        ? groupState.unreadMentionsCount
        : groupState.unreadCount) || 0;

    return {
      unreadCount,
      important: unreadCount ? !!groupState.unreadMentionsCount : false,
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
    }

    return this._removeCurrentUmiFromSection(counts);
  }

  private _getMergedUnreadCounts(ids: string[]): UnreadCounts {
    const onlyIncludeTeamMention =
      getSingleEntity(ENTITY_NAME.PROFILE, 'newMessageBadges') ===
      NEW_MESSAGE_BADGES_OPTIONS.GROUPS_AND_MENTIONS;
    const counts: UnreadCounts = { unreadCount: 0, mentionCount: 0 };
    ids.forEach((id: string) => {
      const badge: BadgeModel = getEntity(ENTITY_NAME.BADGE, id);
      if (
        (id === GROUP_BADGE_TYPE.TEAM ||
          id === GROUP_BADGE_TYPE.FAVORITE_TEAM) &&
        onlyIncludeTeamMention
      ) {
        counts.unreadCount += badge.mentionCount;
      } else {
        counts.unreadCount += badge.unreadCount;
      }
      counts.mentionCount += badge.mentionCount;
    });
    return counts;
  }

  private _removeCurrentUmiFromSection(counts: UnreadCounts) {
    untracked(() => {
      const shouldShowUMI = getGlobalValue(GLOBAL_KEYS.SHOULD_SHOW_UMI);
      if (!shouldShowUMI) {
        const currentConversationId = getGlobalValue(
          GLOBAL_KEYS.CURRENT_CONVERSATION_ID,
        );
        const stateService = ServiceLoader.getInstance<StateService>(
          ServiceConfig.STATE_SERVICE,
        );
        const currentUnreadInfo = stateService.getSingleGroupBadge(
          currentConversationId,
        );
        if (
          currentUnreadInfo &&
          currentUnreadInfo.unreadCount &&
          this._isInThisSection(currentUnreadInfo.id)
        ) {
          if (currentUnreadInfo.isTeam) {
            counts.unreadCount =
              counts.unreadCount - currentUnreadInfo.mentionCount;
          } else {
            counts.unreadCount =
              counts.unreadCount - currentUnreadInfo.unreadCount;
          }
          counts.mentionCount =
            (counts.mentionCount || 0) - currentUnreadInfo.mentionCount;
        }
      }
    });
    return {
      unreadCount: counts.unreadCount,
      important: !!counts.mentionCount,
    };
  }

  private _isInThisSection(badgeType: string): boolean {
    if (this.props.type === UMI_SECTION_TYPE.ALL) {
      return true;
    }
    switch (badgeType) {
      case GROUP_BADGE_TYPE.TEAM: {
        return this.props.type === UMI_SECTION_TYPE.TEAM;
      }
      case GROUP_BADGE_TYPE.DIRECT_MESSAGE: {
        return this.props.type === UMI_SECTION_TYPE.DIRECT_MESSAGE;
      }
      case GROUP_BADGE_TYPE.FAVORITE_TEAM: {
        return this.props.type === UMI_SECTION_TYPE.FAVORITE;
      }
      case GROUP_BADGE_TYPE.FAVORITE_DM: {
        return this.props.type === UMI_SECTION_TYPE.FAVORITE;
      }
    }
    return false;
  }

  updateAppUmi() {
    this._appStore.setUmi(this.unreadCount);
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
