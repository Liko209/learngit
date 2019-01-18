/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-28 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { GroupService, PERMISSION_ENUM } from 'sdk/module/group';
import { MemberHeaderViewProps } from './types';
import { ProfileDialogGroupViewModel } from '../../../Group.ViewModel';

class MemberHeaderViewModel extends ProfileDialogGroupViewModel
  implements MemberHeaderViewProps {
  private _groupService: GroupService = new GroupService();
  @computed
  get hasShadow() {
    return getGlobalValue(GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW);
  }

  @computed
  get isCurrentUserHasPermissionAddTeam() {
    return this._groupService.isCurrentUserHasPermission(
      this.group.id,
      PERMISSION_ENUM.TEAM_ADD_MEMBER,
    );
  }
}
export { MemberHeaderViewModel };
