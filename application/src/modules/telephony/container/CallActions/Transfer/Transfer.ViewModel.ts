/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-08-21 13:58:11
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps } from './types';
import { container } from 'framework/ioc';
import { TelephonyStore } from '../../../store';
import { analyticsCollector } from '@/AnalyticsCollector';

class TransferViewModel extends StoreViewModel<Props> implements ViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  directToTransferPage = () => {
    analyticsCollector.directToTransferPage();
    this._telephonyStore.directToTransferPage();
  };
}

export { TransferViewModel };
