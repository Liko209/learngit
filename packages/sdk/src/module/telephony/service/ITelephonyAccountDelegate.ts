/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-28 09:14:48
 * Copyright © RingCentral. All rights reserved.
 */
import { TELEPHONY_ACCOUNT_STATE } from '../types';

interface ITelephonyAccountDelegate {
  onAccountStateChanged(state: TELEPHONY_ACCOUNT_STATE): void;
}

export { ITelephonyAccountDelegate };
