/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:22:04
 * Copyright © RingCentral. All rights reserved.
 */

import { BUTTON_TYPE } from 'jui/pattern/Phone/VoicemailItem';
import { PHONE_TAB } from '@/AnalyticsCollector/constants';
import { ENTITY_TYPE } from '../../constants';

type ReadProps = {
  id: number;
  type: BUTTON_TYPE;
};

type ReadViewProps = {
  type: BUTTON_TYPE;
  isRead: boolean;
  read: () => void;
  tabName: PHONE_TAB;
  entity: ENTITY_TYPE;
};

export { ReadProps, ReadViewProps };
