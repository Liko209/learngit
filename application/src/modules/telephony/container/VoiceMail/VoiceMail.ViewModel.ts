/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { container } from 'framework';
import { TelephonyService } from '../../service';
import { StoreViewModel } from '@/store/ViewModel';
import { VoiceMailProps, VoiceMailViewProps } from './types';
import { TELEPHONY_SERVICE } from '../../interface/constant';

class VoiceMailViewModel extends StoreViewModel<VoiceMailProps>
  implements VoiceMailViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  sendToVoiceMail = () => {
    this._telephonyService.sendToVoiceMail();
  }
}

export { VoiceMailViewModel };
