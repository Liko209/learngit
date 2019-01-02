/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-28 10:37:17
 * Copyright © RingCentral. All rights reserved.
 */
import { AccountState } from './types';
import { RTCCall } from './RTCCall';

interface IRTCAccountListener {
  onAccountStateChanged(accountState: AccountState): void;
  onReceiveIncomingCall(call: RTCCall): void;
}

export { IRTCAccountListener };
