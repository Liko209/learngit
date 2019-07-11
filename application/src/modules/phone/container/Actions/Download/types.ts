/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:27:21
 * Copyright © RingCentral. All rights reserved.
 */
import { BUTTON_TYPE } from 'jui/pattern/Phone/VoicemailItem';
import { PHONE_TAB } from '@/AnalyticsCollector/constants';
import { ENTITY_TYPE } from '../../constants';

type DownloadProps = {
  id: number;
};

type DownloadViewProps = {
  date: string;
  type: BUTTON_TYPE;
  tabName: PHONE_TAB;
  entity: ENTITY_TYPE;
  getUri: () => Promise<string>;
};

export { DownloadProps, DownloadViewProps };
