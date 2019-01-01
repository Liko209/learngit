/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-21 13:04:16
 * Copyright © RingCentral. All rights reserved.
 */
enum UA_EVENT {
  REG_SUCCESS = 'uaRegisterSuccess',
  REG_FAILED = 'uaRegisterFailed',
}
interface IRTCUserAgent {
  register(options?: any): any;
  makeCall(phoneNumber: string, options: any): any;
}

export { IRTCUserAgent, UA_EVENT };
