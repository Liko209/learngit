/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-21 13:04:16
 * Copyright © RingCentral. All rights reserved.
 */

interface IRTCUserAgent {
  register(options: any): any;
  makeCall(target, [options, modifiers]): any;
}

export { IRTCUserAgent };
