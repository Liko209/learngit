/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 10:12:56
 * Copyright © RingCentral. All rights reserved.
 */
import { TabConfig } from './types';
import { CallHistory } from '../CallHistory';
import { PhoneUMIType } from '../PhoneUMI/types';
import { Voicemail } from '../Voicemail';

const kDefaultPhoneTabPath = '/phone/callhistory';

const TelephonyTabs: TabConfig[] = [
  {
    title: 'phone.tab.callHistory',
    path: kDefaultPhoneTabPath,
    automationID: 'phone-tab-callhistory',
    component: CallHistory,
    UMIType: PhoneUMIType.MISSEDCALL,
  },
  {
    title: 'phone.voicemail',
    path: '/phone/voicemail',
    automationID: 'phone-tab-voicemail',
    component: Voicemail,
    UMIType: PhoneUMIType.VOICEMAIL,
  },
  // {
  //   title: 'phone.faxes',
  //   path: '/phone/faxes',
  //   automationID: 'phone-tab-faxes',
  //   component: CallHistory,
  // },
  // {
  //   title: 'phone.recordings',
  //   path: '/phone/recordings',
  //   automationID: 'phone-tab-recording',
  //   component: CallHistory,
  // },
];

export { TabConfig, TelephonyTabs, kDefaultPhoneTabPath };
