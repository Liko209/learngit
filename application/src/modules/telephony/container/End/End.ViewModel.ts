/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { container } from 'framework';
import { TelephonyService } from '../../service';
import { StoreViewModel } from '@/store/ViewModel';
import { EndProps, EndViewProps } from './types';
import { TELEPHONY_SERVICE } from '../../interface/constant';

const ACTIVATION_CALL_TIME = 1000;

class EndViewModel extends StoreViewModel<EndProps> implements EndViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );

  constructor(props: EndProps) {
    super(props);
  }

  end = () => {
    if (
      +new Date() - this._telephonyService.uiCallStartTime <
      ACTIVATION_CALL_TIME
    ) {
      return;
    }
    this._telephonyService.hangUp();
  }
}

export { EndViewModel };
