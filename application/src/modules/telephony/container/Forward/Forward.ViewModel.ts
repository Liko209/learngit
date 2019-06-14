/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-05-30 13:55:51
 * Copyright © RingCentral. All rights reserved.
 */

// import { computed } from 'mobx';
// import { ENTITY_NAME } from '@/store';
// import { getEntity } from '@/store/utils';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps } from './types';
import { TelephonyStore } from '../../store';
import { container } from 'framework';

class ForwardViewModel extends StoreViewModel<Props> implements ViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  quitForward = () => {
    this._telephonyStore.backIncoming();
  }

  dispose = () => {
    this._telephonyStore.backIncoming();
  }
}

export { ForwardViewModel };
