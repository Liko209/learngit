/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { computed } from 'mobx';
import { MemberListHeaderProps } from './types';
import { BaseProfileTypeHandler } from '../../TypeIdHandler';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';

class MemberListHeaderViewModel extends StoreViewModel<MemberListHeaderProps> {
  constructor() {
    super();
  }
  @computed
  private get _id() {
    return this.props.id;
  }
  @computed
  private get _group() {
    return getEntity(ENTITY_NAME.GROUP, this._id);
  }
  @computed
  get counts() {
    return this._group && this._group.members.length;
  }
  @computed
  get idType() {
    return new BaseProfileTypeHandler(this._id).idType;
  }
}
export { MemberListHeaderViewModel };
