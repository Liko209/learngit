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

class EndViewModel extends StoreViewModel<EndProps> implements EndViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  end = () => {
    this._telephonyService.hangUp();
  }
}

export { EndViewModel };
