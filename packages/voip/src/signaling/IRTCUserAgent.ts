/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-21 13:04:16
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCCallOptions } from '../api/types';
import { ProvisionDataOptions } from './types';
interface IRTCUserAgent {
  reRegister(): void;
  register(options?: ProvisionDataOptions): void;
  makeCall(phoneNumber: string, options: RTCCallOptions): void;
}

export { IRTCUserAgent };
