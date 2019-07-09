/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-26 13:18:18
 * Copyright © RingCentral. All rights reserved.
 */
import { Caller } from 'sdk/module/RCItems/types';
import { PHONE_TAB } from '@/AnalyticsCollector/constants';
import { BUTTON_TYPE } from 'jui/pattern/Phone/VoicemailItem';
import { ENTITY_TYPE } from '../../constants';

type CallProps = {
  id: number;
  caller: Caller;
  entity: ENTITY_TYPE;
  tabName: PHONE_TAB;
};

type CallViewProps = {
  type: BUTTON_TYPE;
  entity: ENTITY_TYPE;
  doCall: () => Promise<void>;
};

export { CallProps, CallViewProps, ENTITY_TYPE };
