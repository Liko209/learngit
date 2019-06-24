/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-06-24 13:14:11
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { computed, action, observable } from 'mobx';
import { BlockProps } from './types';

class BlockViewModel extends StoreViewModel<BlockProps> {
  @observable blockStatus: boolean = false;

  @computed
  isBlocked() {
    return this.blockStatus;
  }

  @action
  block = async () => {
    this.blockStatus = !this.blockStatus;
  }
}

export { BlockViewModel };
