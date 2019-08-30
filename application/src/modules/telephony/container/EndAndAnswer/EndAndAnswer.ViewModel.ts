/*
 * @Author: Spike.Yang
 * @Date: 2019-08-22 17:01:49
 * Copyright © RingCentral. All rights reserved.
 */

import { container } from 'framework/ioc';
import { TelephonyService } from '../../service';
import { StoreViewModel } from '@/store/ViewModel';
import { EndAndAnswerProps, EndAndAnswerViewProps } from './types';
import { TELEPHONY_SERVICE } from '../../interface/constant';

class EndAndAnswerViewModel extends StoreViewModel<EndAndAnswerProps>
  implements EndAndAnswerViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  endAndAnswer = () => {
    this._telephonyService.endAndAnswer();
  };
}

export { EndAndAnswerViewModel };
