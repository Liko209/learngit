/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-27 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { DataTracking } from '@/interface/setting';
import { dataAnalysis } from 'sdk';

const dataTrackingForSetting = (config: DataTracking, value?: any) => {
  const { optionTransform, eventName, ...rest } = config;
  const option = optionTransform ? optionTransform(value) : value;
  console.log('looper', option, rest, eventName);
  const parameters = option
    ? {
        option,
        ...rest,
      }
    : rest;
  dataAnalysis.track(
    eventName || 'Jup_Web/DT_settings_updateSetting',
    parameters,
  );
};

export { dataTrackingForSetting };
