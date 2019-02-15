/*
 * @Author: looper.wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-12 09:00:00
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, action } from 'mobx';
import { GroupService } from 'sdk/module/group';
import { MenuViewModelProps } from './types';
import StoreViewModel from '@/store/ViewModel';

class MenuViewModel extends StoreViewModel<MenuViewModelProps>
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
}
export { MenuViewModel };
