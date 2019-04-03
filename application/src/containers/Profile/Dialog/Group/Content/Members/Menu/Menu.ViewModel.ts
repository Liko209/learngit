/*
 * @Author: looper.wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-12 09:00:00
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, action } from 'mobx';
import { GroupService } from 'sdk/module/group';
import { MenuViewModelProps, MenuProps } from './types';
import StoreViewModel from '@/store/ViewModel';

class MenuViewModel extends StoreViewModel<MenuProps>
  implements MenuViewModelProps {
  private _GroupService: GroupService = GroupService.getInstance();
  @computed
  get personId() {
    return this.props.personId;
  }

  @computed
  get groupId() {
    return this.props.groupId;
  }

  @action
  removeFromTeam = async () => {
    await this._GroupService.removeTeamMembers([this.personId], this.groupId);
  }
  @action
  toggleTeamAdmin = async () => {
    const { isThePersonAdmin } = this.props;
    if (isThePersonAdmin) {
      await this._GroupService.revokeAdmin(this.groupId, this.personId);
    } else {
      await this._GroupService.makeAdmin(this.groupId, this.personId);
    }
  }
}
export { MenuViewModel };
