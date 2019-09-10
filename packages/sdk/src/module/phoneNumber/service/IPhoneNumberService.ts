/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-08-26 15:46:26
 * Copyright © RingCentral. All rights reserved.
 */

interface IPhoneNumberService {
  isShortNumber(phoneNumber: string): Promise<boolean>;
  isSpecialNumber(phoneNumber: string): Promise<boolean>;
  getE164PhoneNumber(phoneNumber: string): Promise<string>;
  isValidNumber(toNumber: string): boolean;
}

export { IPhoneNumberService };
