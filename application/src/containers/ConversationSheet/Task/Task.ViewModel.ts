/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 19:18:07
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { StoreViewModel } from '@/store/ViewModel';
import { Props } from './types';

class TaskViewModel extends StoreViewModel<Props> {
  @computed
  private get _id() {
    return this.props.ids[0];
  }

  @computed
  get task() {
    return getEntity(ENTITY_NAME.ITEM, this._id);
  }
}

export { TaskViewModel };
