/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { container } from 'framework';
import { TelephonyService } from '../../service';
import { StoreViewModel } from '@/store/ViewModel';
import { EndProps, EndViewProps } from './types';

class EndViewModel extends StoreViewModel<EndProps> implements EndViewProps {
  private _telephonyService: TelephonyService = container.get(TelephonyService);
  end = () => {
    this._telephonyService.hangUp();
  }
}

export { EndViewModel };
