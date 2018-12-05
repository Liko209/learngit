/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { computed, observable, action } from 'mobx';
import { MoreHorizProps } from './types';
import { GroupService } from 'sdk/service';

class MoreHorizViewModel extends StoreViewModel<MoreHorizProps> {
  private _groupService: GroupService = GroupService.getInstance();
  @observable
  private _email = '';
  @computed
  private get  _id() {
    return this.props.id;
  }
  @computed
  get groupUrl() {
    return `${window.location.origin}/messages/${this._id}`;
  }
  @action
  private _getEmail = async () => {
    this._email = await this._groupService.getGroupEmail(this._id);
  }
  @computed
  get email() {
    this._getEmail();
    return this._email;
  }
}
export { MoreHorizViewModel };
