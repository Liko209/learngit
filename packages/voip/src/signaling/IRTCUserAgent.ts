import { EventEmitter2 } from 'eventemitter2';

/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-21 13:04:16
 * Copyright © RingCentral. All rights reserved.
 */
interface IRTCUserAgent extends EventEmitter2 {
  register(options?: any): any;
  makeCall(phoneNumber: string, options: any): any;
}

export { IRTCUserAgent };
