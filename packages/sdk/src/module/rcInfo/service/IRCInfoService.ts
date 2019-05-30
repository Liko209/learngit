/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-02 20:43:11
 * Copyright © RingCentral. All rights reserved.
 */

import { ERCWebSettingUri, ForwardingFlipNumberModel } from '../types';
import { DialingCountryInfo } from 'sdk/api/ringcentral/types';
import { PhoneNumberModel } from 'sdk/module/person/entity';

interface IRCInfoService {
  generateWebSettingUri: (type: ERCWebSettingUri) => Promise<string>;

  getCurrentCountry(): Promise<DialingCountryInfo>;

  getAreaCode(): Promise<string>;

  getCallerIdList(): Promise<PhoneNumberModel[]>;

  getCountryList(): Promise<DialingCountryInfo[]>;

  hasAreaCode(countryCallingCode: string): boolean;

  getForwardingNumberList(): Promise<ForwardingFlipNumberModel[]>;

  getFlipNumberList(): Promise<ForwardingFlipNumberModel[]>;
}

export { IRCInfoService };
