/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
// import { getEntity, getGlobalValue } from '@/store/utils';
import { computed } from 'mobx';
// import { getEntity } from '@/store/utils';
import { SortableGroupMemberHandler } from '@/store/handler/groupMemberSortableHandler';
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
  _sortMemberIds = async () => {
    const handler = await SortableGroupMemberHandler.createSortableGroupMemberHandler(this._id);
    return handler && handler.getSortedGroupMembersIds();
  }
  @computed
  get membersList() {
    // return this._sortMemberIds && this._sortMemberIds.map((item) => {
    //   return getEntity(ENTITY_NAME.PERSON)
    // });
    console.log('membersList', this._sortMemberIds());
    return 1;
  }
  // @computed
  // private get _id() {
  //   // console.log('_id', getGlobalValue(GLOBAL_KEYS.GROUP_OR_TEAM_ID));
  //   return getGlobalValue(GLOBAL_KEYS.GROUP_OR_TEAM_ID);
  // }
}
export { MembersListViewModel };
