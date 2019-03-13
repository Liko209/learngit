/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-13 10:50:30
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { MenuProps } from './types';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/module/group/entity';
import { ENTITY_NAME } from '@/store';

class MenuViewModel extends StoreViewModel<MenuProps> {
  @computed
  get group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.props.id);
  }
}
export { MenuViewModel };
