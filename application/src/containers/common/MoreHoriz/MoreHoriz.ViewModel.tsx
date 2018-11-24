/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { computed } from 'mobx';
import { MoreHorizProps } from './types';

class MoreHorizViewModel extends StoreViewModel<MoreHorizProps> {
  @computed
  get groupUrl() {
    return `${window.location.origin}/messages/${this.props.id}`;
  }
}
export { MoreHorizViewModel };
