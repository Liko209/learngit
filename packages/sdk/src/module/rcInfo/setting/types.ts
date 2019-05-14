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

export { RegionSettingInfo };
