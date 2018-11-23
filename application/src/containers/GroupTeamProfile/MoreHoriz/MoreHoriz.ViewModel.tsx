/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity, getGlobalValue } from '@/store/utils';
import { computed } from 'mobx';
import { ENTITY_NAME } from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import GroupModel from '@/store/models/Group';
import { MoreHorizProps } from './types';

class MoreHorizViewModel extends StoreViewModel<MoreHorizProps> {
  @computed
  private get _id() {
    return getGlobalValue(GLOBAL_KEYS.GROUP_OR_TEAM_ID);
  }
  @computed
  private get _group() {
    return this._id && getEntity(ENTITY_NAME.GROUP, this._id) as GroupModel;
  }
  @computed
  get displayName() {
    return this._group && this._group.displayName;
  }
}
export { MoreHorizViewModel };
