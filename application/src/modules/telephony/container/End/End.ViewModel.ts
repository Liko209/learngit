/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { container } from 'framework/ioc';
import { TelephonyService } from '../../service';
import { TelephonyStore } from '../../store';
import { StoreViewModel } from '@/store/ViewModel';
import { EndProps, EndViewProps } from './types';
import { TELEPHONY_SERVICE } from '../../interface/constant';

const ACTIVATION_CALL_TIME = 1000;

class EndViewModel extends StoreViewModel<EndProps> implements EndViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );

  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  constructor(props: EndProps) {
    super(props);
  }

  end = () => {
    if (
      Date.now() - this._telephonyStore.callConnectingTime <
      ACTIVATION_CALL_TIME
    ) {
      return;
    }
    this._telephonyService.hangUp();
  }
}

export { EndViewModel };
