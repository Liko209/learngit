/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { computed, observable, action } from 'mobx';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import SortableGroupMemberHandler from '@/store/handler/SortableGroupMemberHandler';
import { MemberListProps } from './types';
import { GlipTypeUtil } from 'sdk/utils';
import TypeDictionary from 'sdk/utils/glip-type-dictionary/types';

import {
  loadingBottom,
  onScrollToBottom,
} from '@/plugins/InfiniteListPlugin';
class MembersListViewModel extends StoreViewModel<MemberListProps> {
  @observable
  private _memberListHandler : SortableGroupMemberHandler | null = null;
  private _allMemberIds: number[] = [];
  @observable
  private pagination: number = 1;
  private _PAGE_COUNT = 20;
  constructor() {
    super();
    this.toBottom = this.toBottom.bind(this);
  }
  @computed
  private get _id() {
    return this.props.id;
  }
  @action
  private _createSortableMemberIds = async () => {
    if (!this._memberListHandler) {
      this._memberListHandler = await SortableGroupMemberHandler.createSortableGroupMemberHandler(this._id);
    }
  }
  @computed
  private get _group() {
    return getEntity(ENTITY_NAME.GROUP, this._id);
  }
  @computed
  private get _paginationMemberIds() {
    this._createSortableMemberIds();
    this._allMemberIds = (this._memberListHandler && this._memberListHandler.getSortedGroupMembersIds()) || [];
    return this._allMemberIds.slice(0, this.pagination * this._PAGE_COUNT);
  }
  @computed
  get isThePersonGuests() {
    return this._paginationMemberIds && this._paginationMemberIds.map((id: number) => {
      return this._group.isThePersonGuest(id);
    });
  }
  @computed
  get isThePersonAdmins() {
    if (GlipTypeUtil.extractTypeId(this._id) === TypeDictionary.TYPE_ID_TEAM) {
      return this._paginationMemberIds && this._paginationMemberIds.map((id: number) => {
        return this._group.isThePersonAdmin(id);
      });
    }
    return false;
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
    if (this._allMemberIds.length === this._paginationMemberIds.length) return;
    this.pagination++;
  }
}
export { MembersListViewModel };
