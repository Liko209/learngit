/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-21 13:04:16
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';
import { RTCCallOptions } from '../api/types';
import { ProvisionDataOptions } from './types';
interface IRTCUserAgent extends EventEmitter2 {
  reRegister(): void;
  register(options?: ProvisionDataOptions): void;
  makeCall(phoneNumber: string, options: RTCCallOptions): any;
}

export { IRTCUserAgent };
