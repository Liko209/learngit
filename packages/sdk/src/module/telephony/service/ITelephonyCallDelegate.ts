/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-28 09:17:51
 * Copyright © RingCentral. All rights reserved.
 */
import { TELEPHONY_CALL_STATE } from '../types';

interface ITelephonyCallDelegate {
  onCallStateChange(callId: string, state: TELEPHONY_CALL_STATE): void;
}

export { ITelephonyCallDelegate };
