/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
// import { getEntity, getGlobalValue } from '@/store/utils';
// import { computed } from 'mobx';
// import { ENTITY_NAME } from '@/store';
// import { GLOBAL_KEYS } from '@/store/constants';
// import GroupModel from '@/store/models/Group';
// import {
//   onScrollToTop,
//   onScroll,
//   loading,
//   loadingTop,
//   onScrollToBottom,
// } from '@/plugins/InfiniteListPlugin';
class MembersListViewModel extends StoreViewModel<{id: number}> {
  // @computed
  // private get _id() {
  //   // console.log('_id', getGlobalValue(GLOBAL_KEYS.GROUP_OR_TEAM_ID));
  //   return getGlobalValue(GLOBAL_KEYS.GROUP_OR_TEAM_ID);
  // }
}
export { MembersListViewModel };
