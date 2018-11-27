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
import { CONVERSATION_TYPES } from '@/constants';

class MembersItemViewModel extends StoreViewModel<MembersItemProps> {
  @computed
  private get _pid() {
    return this.props.pid;
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
    return this._group.isThePersonGuest(this._pid);
  }
  @computed
  get isThePersonAdmin() {
    if (this._group.type === CONVERSATION_TYPES.TEAM) {
      return this._group.isThePersonAdmin(this._pid);
    }
    return false;
  }
  @computed
  get member() {
    return getEntity(ENTITY_NAME.PERSON, this._pid);
  }
}
export { MembersItemViewModel };
