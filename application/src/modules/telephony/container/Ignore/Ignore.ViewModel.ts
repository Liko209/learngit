/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { container } from 'framework/ioc';
import { TelephonyService } from '../../service';
import { StoreViewModel } from '@/store/ViewModel';
import { IgnoreProps, IgnoreViewProps } from './types';
import { TELEPHONY_SERVICE } from '../../interface/constant';

class IgnoreViewModel extends StoreViewModel<IgnoreProps>
  implements IgnoreViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  ignore = () => {
    this._telephonyService.ignore();
  }
}

export { IgnoreViewModel };
