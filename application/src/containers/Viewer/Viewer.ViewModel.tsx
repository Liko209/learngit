/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { ViewerProps } from './types';

class ViewerViewModel extends AbstractViewModel<ViewerProps> implements ViewerProps {
  @computed
  get itemId() {
    return this.props.itemId; // personId || conversationId
  }
  @computed
  get viewerType() {
    return this.props.viewerType;
  }
}

export { ViewerViewModel };
