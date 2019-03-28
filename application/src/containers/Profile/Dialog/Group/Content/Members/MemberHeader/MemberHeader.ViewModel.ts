/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-28 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { MemberHeaderViewProps } from './types';
import { MembersViewModel } from '../Members.ViewModel';

class MemberHeaderViewModel extends MembersViewModel
  implements MemberHeaderViewProps {
  @computed
  get hasShadow() {
    return getGlobalValue(GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW);
  }

  @computed
  get isCurrentUserHasPermissionAddMember() {
    return this.group.isCurrentUserHasPermissionAddMember;
  }
}
export { MemberHeaderViewModel };
