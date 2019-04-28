/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { ActionsProps, ActionsViewProps } from './types';

class ActionsViewModel extends StoreViewModel<ActionsProps>
  implements ActionsViewProps {
  @computed
  get postId() {
    return this.props.postId;
  }
  @computed
  get groupId() {
    return this.props.groupId;
  }
}

export { ActionsViewModel };
