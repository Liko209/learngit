/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:58:35
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
// import { CallHistoryTypes } from './types';
import { AllCalls, CallLogType } from '../AllCalls';

type TabConfig = {
  title: string;
  container: React.ComponentType<any>;
  automationID: string;
  empty: {
    text: string;
  };
};

const TAB_CONFIG = [
  {
    title: 'phone.AllCalls',
    container: (props: any) => <AllCalls type={CallLogType.All} {...props} />,
    empty: {
      text: '',
    },
    automationID: 'CallHistoryAllCalls',
  },
  {
    title: 'phone.MissedCalls',
    container: (props: any) => (
      <AllCalls type={CallLogType.MissedCall} {...props} />
    ),
    empty: {
      text: '',
    },
    automationID: 'CallHistoryMissedCalls',
  },
];

export { TAB_CONFIG, TabConfig };
