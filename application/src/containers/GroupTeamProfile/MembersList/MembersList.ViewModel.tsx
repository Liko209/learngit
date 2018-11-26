/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { computed } from 'mobx';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { BaseProfileHandler } from '../TypeIdHandler';

// import { SortableGroupMemberHandler } from '@/store/handler/groupMemberSortableHandler';
// import { ENTITY_NAME } from '@/store';
// import { GLOBAL_KEYS } from '@/store/constants';
// import GroupModel from '@/store/models/Group';
// import {
//   // onScrollToTop,
//   onScroll,
//   // loading,
//   // loadingTop,
//   onScrollToBottom,
// } from '@/plugins/InfiniteListPlugin';
class MembersListViewModel extends StoreViewModel<{id: number}> {
  constructor() {
    super();
  }
  @computed
  get _id() {
    return this.props.id;
  }
  @computed
  get _group() {
    return getEntity(ENTITY_NAME.GROUP, this._id);
  }
  // _sortMemberIds = async () => {
  //   return getEntity(ENTITY_NAME.GROUP, this._id);
  //   // const handler = await SortableGroupMemberHandler.createSortableGroupMemberHandler(this._id);
  //   // return handler && handler.getSortedGroupMembersIds();
  // }
  @computed
  get membersList() {
    // return this._sortMemberIds && this._sortMemberIds.map((item) => {
    //   return getEntity(ENTITY_NAME.PERSON)
    // });
    return this._group && this._group.members.map((item: number) => {
      return getEntity(ENTITY_NAME.PERSON, item);
    });
    // console.log('membersList', this._group.members);
  }
  @computed
  get idType() {
    return new BaseProfileHandler(this._id).idType;
  }
  @computed
  get counts() {
    return this._group.members.length;
  }
  // @computed
  // private get _id() {
  //   // console.log('_id', getGlobalValue(GLOBAL_KEYS.GROUP_OR_TEAM_ID));
  //   return getGlobalValue(GLOBAL_KEYS.GROUP_OR_TEAM_ID);
  // }
}
export { MembersListViewModel };
