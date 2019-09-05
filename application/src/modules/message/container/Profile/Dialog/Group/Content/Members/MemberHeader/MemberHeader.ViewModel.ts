/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-28 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { getGlobalValue, getEntity } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/module/group/entity';
import { ENTITY_NAME } from '@/store';
import { StoreViewModel } from '@/store/ViewModel';
import { COUNT_TO_SHOW_SEARCH } from '../constants';
import { MemberHeaderViewProps, MemberHeaderProps } from './types';

class MemberHeaderViewModel extends StoreViewModel<MemberHeaderProps>
  implements MemberHeaderViewProps {
  @computed
  get hasShadow() {
    return getGlobalValue(GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW);
  }

  @computed
  get isCurrentUserHasPermissionAddMember() {
    return this.group.isCurrentUserHasPermissionAddMember;
  }

  @computed
  get group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.props.id);
  }

  @computed
  get hasSearch() {
    return (
      this.group.members && this.group.members.length > COUNT_TO_SHOW_SEARCH
    );
  }
}
export { MemberHeaderViewModel };
