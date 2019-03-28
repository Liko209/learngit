/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-04 19:16:39
 * Copyright © RingCentral. All rights reserved.
 */

import { JOB_KEY } from './constants';

type JobInfo = {
  key: JOB_KEY;
  intervalSeconds: number;
  periodic: boolean;
  retryTime: number;
  executeFunc: (callback: (successful: boolean) => void) => any;
  needNetwork: boolean;
  jobId?: NodeJS.Timeout;
  isExecuting?: boolean;
  isDropt?: boolean;
};

export { JobInfo };
