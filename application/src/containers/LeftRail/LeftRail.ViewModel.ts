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
import AccountService from 'sdk/service/account';
import { GLOBAL_KEYS } from '@/store/constants';
import storeManager from '@/store';
import GlobalStore from '@/store/base/GlobalStore';
import { POST_LIST_TYPE } from '../PostListPage/types';
import { getGlobalValue } from '@/store/utils';

class LeftRailViewModel extends StoreViewModel<LeftRailProps>
  implements LeftRailViewProps {
  private _accountService: AccountService = AccountService.getInstance();
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
        title: 'mention_plural',
        icon: 'alternate_email',
        type: POST_LIST_TYPE.mentions,
        testId: 'entry-mentions',
      },
      {
        title: 'bookmark_plural',
        icon: 'bookmark_border',
        type: POST_LIST_TYPE.bookmarks,
        testId: 'entry-bookmarks',
      },
    ];
  }

  @computed
  get filters(): LeftRailFilter[] {
    return [
      {
        label: 'show_unread_plural',
        value: this._unreadOnly,
        onChange: this.toggleUnread,
      },
    ];
  }

  toggleUnread = (evt: any, checked: boolean) => {
    this._globalStore.set(GLOBAL_KEYS.UNREAD_TOGGLE_ON, checked);
    this._accountService.setUnreadToggleSetting(checked);
  }

  sections: SECTION_TYPE[] = [
    SECTION_TYPE.FAVORITE,
    SECTION_TYPE.DIRECT_MESSAGE,
    SECTION_TYPE.TEAM,
  ];
}

export { LeftRailViewModel };
