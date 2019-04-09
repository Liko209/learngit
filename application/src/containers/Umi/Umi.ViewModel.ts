/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 19:01:54
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, untracked } from 'mobx';
import _ from 'lodash';
import { container } from 'framework';
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity, getGlobalValue } from '@/store/utils';
import { UmiProps, UmiViewProps, UMI_SECTION_TYPE } from './types';
import GroupStateModel from '@/store/models/GroupState';
import GroupModel from '@/store/models/Group';
import { ENTITY_NAME } from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { AppStore } from '@/modules/app/store';
import { StateService } from 'sdk/module/state';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

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
      mentionCount: 0,
    };

    if (this.props.type === UMI_SECTION_TYPE.SINGLE) {
      unreadInfo = this._getSingleUnreadInfo();
    } else {
      unreadInfo = this._getSectionUnreadInfo();
    }

    return {
      unreadCount: unreadInfo.unreadCount,
      important: !!unreadInfo.mentionCount,
    };
  }

  private _getSingleUnreadInfo() {
    if (!this.props.id) {
      return { unreadCount: 0, mentionCount: 0 };
    }

    const groupState: GroupStateModel = getEntity(
      ENTITY_NAME.GROUP_STATE,
      this.props.id,
    );
    const group: GroupModel = getEntity(ENTITY_NAME.GROUP, this.props.id);
    const unreadCount =
      (group.isTeam
        ? groupState.unreadMentionsCount
        : groupState.unreadCount) || 0;

    return { unreadCount, mentionCount: groupState.unreadMentionsCount || 0 };
  }

  private _getSectionUnreadInfo() {
    let unreadInfo = {
      unreadCount: 0,
      mentionCount: 0,
    };

    if (this.props.type === UMI_SECTION_TYPE.FAVORITE) {
      unreadInfo = getGlobalValue(GLOBAL_KEYS.FAVORITE_UNREAD);
    } else if (this.props.type === UMI_SECTION_TYPE.DIRECT_MESSAGE) {
      unreadInfo = getGlobalValue(GLOBAL_KEYS.DIRECT_MESSAGE_UNREAD);
    } else if (this.props.type === UMI_SECTION_TYPE.TEAM) {
      unreadInfo = getGlobalValue(GLOBAL_KEYS.TEAM_UNREAD);
    } else {
      unreadInfo = getGlobalValue(GLOBAL_KEYS.TOTAL_UNREAD);
    }

    return this._removeCurrentUmiFromSection(unreadInfo);
  }

  private _removeCurrentUmiFromSection(unreadInfo: {
    unreadCount: number;
    mentionCount: number;
  }) {
    untracked(() => {
      const shouldShowUMI = getGlobalValue(GLOBAL_KEYS.SHOULD_SHOW_UMI);
      if (!shouldShowUMI) {
        const currentConversationId = getGlobalValue(
          GLOBAL_KEYS.CURRENT_CONVERSATION_ID,
        );
        const stateService = ServiceLoader.getInstance<StateService>(
          ServiceConfig.STATE_SERVICE,
        );
        const currentUnreadInfo = stateService.getSingleUnreadInfo(
          currentConversationId,
        );
        if (
          currentUnreadInfo &&
          (this.props.type === UMI_SECTION_TYPE.ALL ||
            this.props.type === currentUnreadInfo.section)
        ) {
          if (currentUnreadInfo.unreadCount > 0) {
            if (currentUnreadInfo.isTeam) {
              unreadInfo.unreadCount -= currentUnreadInfo.mentionCount;
            } else {
              unreadInfo.unreadCount -= currentUnreadInfo.unreadCount;
            }
          }
          unreadInfo.mentionCount -= currentUnreadInfo.mentionCount;
        }
      }
    });
    return unreadInfo;
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
