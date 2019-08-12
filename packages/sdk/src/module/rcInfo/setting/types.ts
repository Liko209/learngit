/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-10 16:06:23
 * Copyright © RingCentral. All rights reserved.
 */

import { DialingCountryInfo } from 'sdk/api/ringcentral/types';

type RegionSettingInfo = {
  countryInfo: DialingCountryInfo;
  areaCode: string;
};

type E911SettingInfo = {
  country: string;
  countryId: string;
  countryName: string;
  countryIsoCode: string;
  street: string;
  street2: string;
  city: string;
  outOfCountry: boolean;
  state: string;
  stateId: string;
  stateIsoCode: string;
  stateName: string;
  zip: string;
  customerName: string;
};

export { RegionSettingInfo, E911SettingInfo };
