/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-02 15:46:35
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { SECTION_TYPE } from './Section/types';
import {
  LeftRailViewProps,
  LeftRailProps,
  LeftRailFilter,
  LeftRailEntry,
} from './types';
import StoreViewModel from '@/store/ViewModel';
import { AccountService } from 'sdk/module/account';
import { GLOBAL_KEYS } from '@/store/constants';
import storeManager from '@/store/base/StoreManager';
import GlobalStore from '@/store/base/GlobalStore';
import { POST_LIST_TYPE } from '../PostListPage/types';
import { getGlobalValue } from '@/store/utils';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { dataAnalysis } from 'foundation/analysis';

class LeftRailViewModel extends StoreViewModel<LeftRailProps>
  implements LeftRailViewProps {
  private _accountService = ServiceLoader.getInstance<AccountService>(
    ServiceConfig.ACCOUNT_SERVICE,
  );
  private _globalStore: GlobalStore = storeManager.getGlobalStore();

  @computed
  private get _unreadOnly() {
    return this._globalStore.get(GLOBAL_KEYS.UNREAD_TOGGLE_ON);
  }

  @computed
  get currentPostListType() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_POST_LIST_TYPE);
  }

  constructor() {
    super();
    const isUnreadOn = this._accountService.getUnreadToggleSetting();
    this._globalStore.set(GLOBAL_KEYS.UNREAD_TOGGLE_ON, isUnreadOn);
  }

  @computed
  get entries(): LeftRailEntry[] {
    return [
      {
        title: 'message.mentionPosts',
        icon: 'mention',
        type: POST_LIST_TYPE.mentions,
        testId: 'entry-mentions',
        iconColor: ['secondary', '600'],
      },
      {
        title: 'message.bookmarkPosts',
        icon: 'bookmark',
        type: POST_LIST_TYPE.bookmarks,
        testId: 'entry-bookmarks',
        iconColor: ['primary', '600'],
      },
    ];
  }

  @computed
  get filters(): LeftRailFilter[] {
    return [
      {
        label: 'message.showUnreads',
        value: this._unreadOnly,
        onChange: this.toggleUnread,
      },
    ];
  }

  toggleUnread = (evt: any, checked: boolean) => {
    this._globalStore.set(GLOBAL_KEYS.UNREAD_TOGGLE_ON, checked);
    this._accountService.setUnreadToggleSetting(checked);

    dataAnalysis.track('Jup_Web/DT_msg_showUnreadToggle', {
      state: checked ? 'on' : 'off'
    });
  };

  sections: SECTION_TYPE[] = [
    SECTION_TYPE.FAVORITE,
    SECTION_TYPE.DIRECT_MESSAGE,
    SECTION_TYPE.TEAM,
  ];
}

export { LeftRailViewModel };
