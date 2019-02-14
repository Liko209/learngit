/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { computed, observable, action } from 'mobx';
import { MoreProps } from './types';
import { GroupService } from 'sdk/module/group';
// import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';

class MoreViewModel extends StoreViewModel<MoreProps> {
  private _groupService: GroupService = GroupService.getInstance();

  @observable
  private _email = '';

  @computed
  get id() {
    return this.props.id;
  }

  @computed
  get size() {
    return this.props.size || 'small';
  }

  @computed
  get url() {
    return `${window.location.origin}/messages/${this.id}`;
  }

  @action
  getEmail = async () => {
    this._email = await this._groupService.getGroupEmail(this.id);
    return this._email;
  }

  @computed
  get email() {
    this.getEmail();
    return this._email;
  }
}
export { MoreViewModel };
