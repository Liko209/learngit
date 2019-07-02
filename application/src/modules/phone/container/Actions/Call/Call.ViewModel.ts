/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-26 14:29:40
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { container } from 'framework';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import { TelephonyService } from '@/modules/telephony/service';

import { CallProps } from './types';

class CallViewModel extends StoreViewModel<CallProps> {
  get _telephonyService() {
    return container.get<TelephonyService>(TELEPHONY_SERVICE);
  }

  doCall = async () => {
    const { caller } = this.props;
    const toNumber = caller.extensionNumber || caller.phoneNumber;
    // actions ensure caller exist
    await this._telephonyService.makeCall(toNumber!);
  }
}

export { CallViewModel };
