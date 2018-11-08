/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-08 17:08:35
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { observable } from 'mobx';
import StoreViewModel from '@/store/ViewModel';
import { StreamProps } from './types';

class StreamViewModel extends StoreViewModel<StreamProps> {
  @observable
  postIds: number[] = [];

  constructor() {
    super();
  }

  onReceiveProps(props: StreamProps) {
    if (this.postIds !== props.postIds) {
      this.postIds = props.postIds;
    }
  }
}

export { StreamViewModel };
