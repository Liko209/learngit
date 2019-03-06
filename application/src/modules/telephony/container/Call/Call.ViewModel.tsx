/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-04 16:12:47
 * Copyright © RingCentral. All rights reserved.
 */

import { container } from 'framework';
import { AbstractViewModel } from '@/base';
import { TelephonyService } from '../../service';
import { CallProps, CallViewProps } from './types';

class CallViewModel extends AbstractViewModel<CallProps>
  implements CallViewProps {
  private _telephonyService: TelephonyService = container.get(TelephonyService);

  makeCall = () => {
    const { phone } = this.props;
    this._telephonyService.makeCall(phone);
  }
}

export { CallViewModel };
