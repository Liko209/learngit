/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-05-27 16:13:35
 * Copyright © RingCentral. All rights reserved.
 */

// import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps } from './types';
import { container } from 'framework/ioc';
import { TelephonyStore } from '../../../store';

class ReplyViewModel extends StoreViewModel<Props> implements ViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  directReply = () => {
    this._telephonyStore.directReply();
  }
}

export { ReplyViewModel };
