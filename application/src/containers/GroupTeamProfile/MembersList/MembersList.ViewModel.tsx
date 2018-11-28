/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { computed, observable, action } from 'mobx';
import SortableGroupMemberHandler from '@/store/handler/SortableGroupMemberHandler';
import { MemberListProps } from './types';
import storeManager from '@/store';
const globalStore = storeManager.getGlobalStore();
import { GLOBAL_KEYS } from '@/store/constants';

import {
  onScroll,
  onScrollToBottom,
} from '@/plugins/InfiniteListPlugin';
class MembersListViewModel extends StoreViewModel<MemberListProps> {
  @observable
  private _memberListHandler: SortableGroupMemberHandler | null = null;
  private _allMemberIds: number[] = [];
  @observable
  private _pagination: number = 1;
  private _PAGE_COUNT = 20;
  constructor() {
    super();
    this.toBottom = this.toBottom.bind(this);
  }
  @computed
  get gid() {
    return this.props.id;
  }
  @action
  private _createSortableMemberIds = async () => {
    if (!this._memberListHandler) {
      this._memberListHandler = await SortableGroupMemberHandler.createSortableGroupMemberHandler(
        this.gid,
      );
    }
  }
  @computed
  get memberIds() {
    this._createSortableMemberIds();
    this._allMemberIds =
      (this._memberListHandler &&
        this._memberListHandler.getSortedGroupMembersIds()) ||
      [];
    return this._allMemberIds.slice(0, this._pagination * this._PAGE_COUNT);
  }
  @action
  @onScrollToBottom
  toBottom() {
    if (this._allMemberIds.length === this.memberIds.length) return;
    this._pagination++;
  }
  @onScroll
  onScrollEvent(event: any) {
    const scrollTop = event.target.scrollTop;
    if (scrollTop > 20) {
      globalStore.set(GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW, true);
    } else {
      globalStore.set(GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW, false);
    }
  }
}
export { MembersListViewModel };
