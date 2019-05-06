/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-27 11:07:38
 * Copyright © RingCentral. All rights reserved.
 */

type StationSettingInfo = {
  szCountryCode: string;
  szAreaCode: string;
  brandId?: number;
  maxShortLen?: number;
  shortPstnPossible?: boolean;
  siteCode?: string;
  shortPinLen?: number;
  outboundCallPrefix?: string;
};

export { StationSettingInfo };
