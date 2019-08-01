/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-30 17:09:21
 * Copyright © RingCentral. All rights reserved.
 */

const OutOfCountryDisclaimer = {
  'United States': [
    'telephony.e911.disclaimer.US/CA1',
    'telephony.e911.disclaimer.US/CA2',
  ],
  Canada: [
    'telephony.e911.disclaimer.US/CA1',
    'telephony.e911.disclaimer.US/CA2',
  ],
  'United Kingdom': ['telephony.e911.disclaimer.UK'],
  default: ['telephony.e911.disclaimer.default'],
};

export { OutOfCountryDisclaimer };
