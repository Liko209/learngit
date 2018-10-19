/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-19 15:33:14
 * Copyright © RingCentral. All rights reserved.
 */
import { parsePhoneNumber } from 'libphonenumber-js';
export default {
  defaultFormat(num: string): string {
    try {
      const phoneNumber = parsePhoneNumber(num);
      // currently use US phone number format, for other regions, use phoneNumber.formatInternational()
      return phoneNumber.formatNational();
    } catch (error) {
      return num;
    }
  },
};
