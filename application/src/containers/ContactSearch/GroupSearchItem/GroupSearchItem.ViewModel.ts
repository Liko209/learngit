/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-04-09 09:53:57
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { Props } from './types';
import { Group } from 'sdk/module/group';
import GroupModel from '@/store/models/Group';

class GroupSearchItemViewModel extends StoreViewModel<Props> {
  @computed
  get person() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.props.id);
  }
}

export { GroupSearchItemViewModel };
