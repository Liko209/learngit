/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-28 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity, getGlobalValue } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { MemberListHeaderProps } from './types';
import { GLOBAL_KEYS } from '@/store/constants';

class MemberListHeaderViewModel extends StoreViewModel<MemberListHeaderProps> {
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
    return this._group.members && this._group.members.length;
  }
  @computed
  get isShowHeaderShadow() {
    return getGlobalValue(GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW);
  }
}
export { MemberListHeaderViewModel };
