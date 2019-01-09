/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-21 13:04:16
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCOptions } from '../types/sipData';
interface IRTCUserAgent {
  reRegister(): void;
  register(options?: RTCOptions): void;
  makeCall(phoneNumber: string, options: RTCOptions): void;
}

export { IRTCUserAgent };
