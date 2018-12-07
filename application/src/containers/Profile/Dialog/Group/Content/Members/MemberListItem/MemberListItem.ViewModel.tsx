/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-27 14:33:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { computed } from 'mobx';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { MemberListItemProps } from './types';

class MemberListItemViewModel extends StoreViewModel<MemberListItemProps> {
  @computed
  get pid() {
    return this.props.pid; // person id
  }

  @computed
  get cid() {
    return this.props.cid; // conversation id
  }

  @computed
  get person() {
    return getEntity(ENTITY_NAME.PERSON, this.pid);
  }

  @computed
  private get _group() {
    return getEntity(ENTITY_NAME.GROUP, this.cid);
  }

  @computed
  get isThePersonAdmin() {
    return this._group.isThePersonAdmin(this.pid);
  }

  @computed
  get isThePersonGuest() {
    return this._group.isThePersonGuest(this.pid);
  }
}
export { MemberListItemViewModel };
