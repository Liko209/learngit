/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { MemberListProps } from './types';
import storeManager, { ENTITY_NAME } from '@/store';
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
  onScrollEvent = (event: React.UIEvent<HTMLElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    const globalStore = storeManager.getGlobalStore();
    globalStore.set(
      GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW,
      scrollTop > 20 ? true : false,
    );
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
