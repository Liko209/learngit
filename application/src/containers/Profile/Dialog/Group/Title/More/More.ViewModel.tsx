/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { computed, action } from 'mobx';
import { MoreProps } from './types';
import { GroupService } from 'sdk/service';
// import { getIdType } from '@/common/getIdType';
// import { TypeDictionary } from 'sdk/utils';

class MoreViewModel extends StoreViewModel<MoreProps> {
  private _groupService: GroupService = GroupService.getInstance();

  @computed
  private get _id() {
    return this.props.id;
  }

  @computed
  get url() {
    return `${window.location.origin}/messages/${this._id}`;
  }

  @action
  getEmail = async () => {
    const email = await this._groupService.getGroupEmail(this._id);
    return email;
  }

  // @computed
  // get isTeam() {
  //   return getIdType(this._id) === TypeDictionary.TYPE_ID_TEAM;
  // }
}
export { MoreViewModel };
