/*
 * @Author: isaac.liu
 * @Date: 2019-06-03 13:42:18
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { AllCallsProps } from './types';
import { AllCallsListHandler } from './AllCallsListHandler';

class AllCallsViewModel extends StoreViewModel<AllCallsProps> {
  @computed
  get listHandler() {
    return new AllCallsListHandler(this.props.type)
      .fetchSortableDataListHandler;
  }
}

export { AllCallsViewModel };
