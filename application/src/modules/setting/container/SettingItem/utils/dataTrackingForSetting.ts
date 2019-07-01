/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-27 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { DataTracking } from '@/interface/setting';
import _ from 'lodash';
import { dataAnalysis } from 'sdk';

const dataTrackingForSetting = (config: DataTracking, value?: any) => {
  const { optionTransform, eventName, ...rest } = config;
  const option = optionTransform ? optionTransform(value) : value;
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

const debounceTrackData = _.debounce(
  (dataTracking: DataTracking, newValue: number) =>
    dataTrackingForSetting(dataTracking, newValue),
  1000,
);

export { dataTrackingForSetting, debounceTrackData };
