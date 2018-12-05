/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable, action } from 'mobx';
import { MemberListProps } from './types';
import storeManager from '@/store';
const globalStore = storeManager.getGlobalStore();
import { GLOBAL_KEYS } from '@/store/constants';
import { GroupTeamMembersViewModel } from '../GroupTeamMembers.ViewModel';

import {
  onScroll,
  onScrollToBottom,
} from '@/plugins/InfiniteListPlugin';

class MembersListViewModel extends GroupTeamMembersViewModel {
  @observable
  private _pagination: number = 1;
  private _PAGE_COUNT = 20;
  constructor(props: MemberListProps) {
    super(props);
    this.toBottom = this.toBottom.bind(this);
  }
  @computed
  get gid() {
    return this.props.id;
  }
  @computed
  get memberIds() {
    return this.allMemberIds.slice(0, this._pagination * this._PAGE_COUNT);
  }
  @action
  @onScrollToBottom
  toBottom() {
    if (this.allMemberIds.length === this.memberIds.length) return;
    this._pagination++;
  }
  @onScroll
  onScrollEvent(event:  { target: HTMLElement }) {
    const scrollTop = event.target.scrollTop;
    if (scrollTop > 20) {
      globalStore.set(GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW, true);
    } else {
      globalStore.set(GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW, false);
    }
  }
}
export { MembersListViewModel };
