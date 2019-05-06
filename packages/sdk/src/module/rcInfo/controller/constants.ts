/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-22 16:41:19
 * Copyright © RingCentral. All rights reserved.
 */

import { DialingCountryInfo } from 'sdk/api/ringcentral/types';
import { RCBrandType } from '../types';

const SELLING_COUNTRY_LIST: DialingCountryInfo[] = [
  { id: '1', name: 'United States', isoCode: 'US', callingCode: '1' },
  { id: '39', name: 'Canada', isoCode: 'CA', callingCode: '1' },
  { id: '224', name: 'United Kingdom', isoCode: 'GB', callingCode: '44' },
  { id: '83', name: 'Germany', isoCode: 'DE', callingCode: '49' },
  { id: '75', name: 'France', isoCode: 'FR', callingCode: '33' },
  { id: '157', name: 'Netherlands', isoCode: 'NL', callingCode: '31' },
  { id: '195', name: 'Spain', isoCode: 'ES', callingCode: '34' },
  { id: '107', name: 'Ireland', isoCode: 'IE', callingCode: '353' },
  { id: '206', name: 'Switzerland', isoCode: 'CH', callingCode: '41' },
  { id: '188', name: 'Singapore', isoCode: 'SG', callingCode: '65' },
  { id: '175', name: 'Philippines', isoCode: 'PH', callingCode: '63' },
  { id: '143', name: 'Mexico', isoCode: 'MX', callingCode: '52' },
  { id: '16', name: 'Austria', isoCode: 'AT', callingCode: '43' },
  { id: '23', name: 'Belgium', isoCode: 'BE', callingCode: '32' },
  { id: '58', name: 'Denmark', isoCode: 'DK', callingCode: '45' },
  { id: '74', name: 'Finland', isoCode: 'FI', callingCode: '358' },
  { id: '100', name: 'Hong Kong', isoCode: 'HK', callingCode: '852' },
  { id: '103', name: 'India', isoCode: 'IN', callingCode: '91' },
  { id: '109', name: 'Italy', isoCode: 'IT', callingCode: '39' },
  { id: '133', name: 'Malaysia', isoCode: 'MY', callingCode: '60' },
  { id: '167', name: 'Norway', isoCode: 'NO', callingCode: '47' },
  { id: '177', name: 'Portugal', isoCode: 'PT', callingCode: '351' },
  { id: '205', name: 'Sweden', isoCode: 'SE', callingCode: '46' },
  { id: '208', name: 'Taiwan', isoCode: 'TW', callingCode: '886' },
  { id: '15', name: 'Australia', isoCode: 'AU', callingCode: '61' },
  { id: '108', name: 'Israel', isoCode: 'IL', callingCode: '972' },
  { id: '128', name: 'Luxembourg', isoCode: 'LU', callingCode: '352' },
  { id: '182', name: 'Romania', isoCode: 'RO', callingCode: '40' },
  { id: '57', name: 'Czech Republic', isoCode: 'CZ', callingCode: '420' },
  { id: '31', name: 'Brazil', isoCode: 'BR', callingCode: '55' },
  { id: '11', name: 'Argentina', isoCode: 'AR', callingCode: '54' },
  { id: '45', name: 'Chile', isoCode: 'CL', callingCode: '56' },
  { id: '160', name: 'New Zealand', isoCode: 'NZ', callingCode: '64' },
  { id: '176', name: 'Poland', isoCode: 'PL', callingCode: '48' },
  { id: '189', name: 'Slovakia', isoCode: 'SK', callingCode: '421' },
  { id: '112', name: 'Japan', isoCode: 'JP', callingCode: '81' },
  { id: '194', name: 'South Korea', isoCode: 'KR', callingCode: '82' },
  { id: '174', name: 'Peru', isoCode: 'PE', callingCode: '51' },
  { id: '54', name: 'Croatia', isoCode: 'HR', callingCode: '385' },
  { id: '101', name: 'Hungary', isoCode: 'HU', callingCode: '36' },
  { id: '193', name: 'South Africa', isoCode: 'ZA', callingCode: '27' },
  { id: '46', name: 'China', isoCode: 'CN', callingCode: '86' },
  { id: '49', name: 'Colombia', isoCode: 'CO', callingCode: '57' },
  { id: '53', name: 'Costa Rica', isoCode: 'CR', callingCode: '506' },
];

const SUPPORT_AREA_CODE_COUNTRIES = ['1', '86', '61', '52'];

enum RC_BRAND_IDS {
  RINGCENTRAL = '1210',
  RINGCENTRAL_UK = '3710',
  ATT = '3420',
  TELUS = '7310',
}

const RC_BRAND_ID_TO_TYPES = {
  1210: RCBrandType.RINGCENTRAL,
  3710: RCBrandType.RINGCENTRAL_UK,
  3420: RCBrandType.ATT,
  7310: RCBrandType.TELUS,
};

const RC_BRAND_NAME_TO_BRAND_ID = {
  RC: '1210',
  ATT: '3420',
  TELUS: '7310',
};

export {
  RC_BRAND_IDS,
  SELLING_COUNTRY_LIST,
  SUPPORT_AREA_CODE_COUNTRIES,
  RC_BRAND_ID_TO_TYPES,
  RC_BRAND_NAME_TO_BRAND_ID,
};
