/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { computed, observable, action } from 'mobx';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { BaseProfileTypeHandler } from '../TypeIdHandler';
import SortableGroupMemberHandler from '@/store/handler/SortableGroupMemberHandler';
import { MemberListProps } from './types';

import {
  loadingBottom,
  // onScroll,
  onScrollToBottom,
} from '@/plugins/InfiniteListPlugin';
class MembersListViewModel extends StoreViewModel<MemberListProps> {
  @observable
  private _MemberListHandler : SortableGroupMemberHandler | null = null;
  private _allMemberIds: number[] = [];
  @observable
  private pagination: number = 1;
  private _PAGE_COUNT = 20;
  // isShowBottomShadow = false;
  constructor() {
    super();
    this.toBottom = this.toBottom.bind(this);
    // this.onScrollEvent = this.onScrollEvent.bind(this);
  }
  @computed
  private get _id() {
    return this.props.id;
  }
  @action
  private _createSortableMemberIds = async () => {
    if (!this._MemberListHandler) {
      this._MemberListHandler = await SortableGroupMemberHandler.createSortableGroupMemberHandler(this._id);
    }
  }
  @computed
  private get _paginationMemberIds() {
    this._createSortableMemberIds();
    this._allMemberIds = (this._MemberListHandler && this._MemberListHandler.getSortedGroupMembersIds()) || [];
    return this._allMemberIds.slice(0, this.pagination * this._PAGE_COUNT);
  }
  @computed
  get isThePersonGuest() {
    return this._paginationMemberIds && this._paginationMemberIds.map((id: number) => {
      return getEntity(ENTITY_NAME.GROUP, this._id).isThePersonGuest(id);
    });
  }
  @computed
  get isThePersonAdmin() {
    return this._paginationMemberIds && this._paginationMemberIds.map((id: number) => {
      return getEntity(ENTITY_NAME.GROUP, this._id).isThePersonAdmin(id);
    });
  }
  @computed
  get idType() {
    return new BaseProfileTypeHandler(this._id).idType;
  }
  @computed
  @loadingBottom
  get membersList() {
    return this._paginationMemberIds && this._paginationMemberIds.map((id: number) => {
      return getEntity(ENTITY_NAME.PERSON, id);
    });
  }
  @action
  @onScrollToBottom
  toBottom() {
    this.pagination++;
  }
  // @onScroll
  // onScrollEvent(event: any) {
  //   const clientHeight = event.target.clientHeight;
  //   const scrollTop = event.target.scrollTop;
  //   const isBottom = clientHeight + scrollTop === event.target.scrollHeight;
  //   if (scrollTop > 20) {
  //     this.isShowBottomShadow = !this.isShowBottomShadow;
  //   }
  //   if (isBottom) {
  //     this.isShowBottomShadow = false;
  //   }
  //   console.log('isBottom', isBottom);
  // }
}
export { MembersListViewModel };
