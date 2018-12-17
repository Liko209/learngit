/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-27 14:33:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { computed } from 'mobx';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { MembersItemProps } from './types';

class MembersItemViewModel extends StoreViewModel<MembersItemProps> {
  @computed
  private get _uid() {
    return this.props.uid;
  }
  @computed
  private get _gid() {
    return this.props.gid;
  }
  @computed
  private get _group() {
    return getEntity(ENTITY_NAME.GROUP, this._gid);
  }
  @computed
  get isThePersonGuest() {
    return this._group.isThePersonGuest(this._uid);
  }
  @computed
  get isThePersonAdmin() {
    return this._group.isThePersonAdmin(this._uid);
  }
  @computed
  get member() {
    return getEntity(ENTITY_NAME.PERSON, this._uid);
  }
}
export { MembersItemViewModel };
