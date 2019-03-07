/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { MemberListProps } from './types';
import storeManager from '@/store';
const globalStore = storeManager.getGlobalStore();
import { GLOBAL_KEYS } from '@/store/constants';
// import { MembersViewModel } from '../Members.ViewModel';

class MemberListViewModel extends StoreViewModel<MemberListProps> {
  @action
  onScrollEvent = (event: { scrollTop: number }) => {
    const scrollTop = event.scrollTop;
    if (scrollTop > 20) {
      globalStore.set(GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW, true);
    } else {
      globalStore.set(GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW, false);
    }
  }
}
export { MemberListViewModel };
