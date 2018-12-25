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
  get id() {
    return this.props.id;
  }

  onBlur = this.props.onBlur;
  onFocus = this.props.onFocus;
}

export { ActionsViewModel };
