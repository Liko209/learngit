/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { container } from 'framework';
import { TelephonyService } from '../../service';
import { StoreViewModel } from '@/store/ViewModel';
import { AnswerProps, AnswerViewProps } from './types';

class AnswerViewModel extends StoreViewModel<AnswerProps>
  implements AnswerViewProps {
  private _telephonyService: TelephonyService = container.get(TelephonyService);
  ignore = () => {
    this._telephonyService.answer();
  }
}

export { AnswerViewModel };
