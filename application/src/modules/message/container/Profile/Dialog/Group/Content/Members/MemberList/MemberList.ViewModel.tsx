/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { MemberListProps } from './types';
import storeManager, { ENTITY_NAME } from '@/store';
const globalStore = storeManager.getGlobalStore();
import { GLOBAL_KEYS } from '@/store/constants';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/module/group/entity';

class MemberListViewModel extends StoreViewModel<MemberListProps> {
  constructor(props: MemberListProps) {
    super(props);
    this.reaction(
      () => this.showEmpty,
      (flag: boolean) => this.props.setShowEmpty(flag),
    );
  }
  @action
  onScrollEvent = (event: { scrollTop: number }) => {
    const scrollTop = event.scrollTop;
    if (scrollTop > 20) {
      globalStore.set(GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW, true);
    } else {
      globalStore.set(GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW, false);
    }
  }

  @computed
  get group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.props.id);
  }

  @computed
  get totalMemberCount() {
    return this.group.members.length;
  }

  @computed
  get showEmpty() {
    const { filteredMemberIds, searchInput } = this.props;
    if (searchInput) {
      return filteredMemberIds.length === 0;
    }
    return this.totalMemberCount === 0;
  }
}
export { MemberListViewModel };
