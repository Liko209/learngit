/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-04-30 08:56:33
 * Copyright © RingCentral. All rights reserved.
 */

import { JOB_KEY } from 'sdk/framework/utils/jobSchedule';

interface ITaskStrategy {
  getNext(): number;
  canNext(): boolean;
  reset(): void;
  getJobKey(): JOB_KEY;
}

export { ITaskStrategy };
