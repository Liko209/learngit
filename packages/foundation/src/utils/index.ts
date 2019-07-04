/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-05-06 10:18:24
 * Copyright © RingCentral. All rights reserved.
 */

import { BuildUtils } from './BuildUtils';
import { uniqueArray, getCurrentTime } from './jsUtils/jsUtils';
import { HeartBeatCheck } from './checker/HeartBeatCheck';
import { sleepModeDetector } from './checker/SleepModeDetector';
import { DateFormatter } from './DateFormatter';
import {
  SPARTA_TIME_RANGE,
  getSpartaRandomTime,
} from './algorithm/SpartaRandomTime';

export {
  BuildUtils,
  uniqueArray,
  getCurrentTime,
  HeartBeatCheck,
  sleepModeDetector,
  DateFormatter,
  SPARTA_TIME_RANGE,
  getSpartaRandomTime,
};
