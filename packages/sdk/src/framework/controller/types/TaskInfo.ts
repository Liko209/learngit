/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-04-30 11:16:56
 * Copyright © RingCentral. All rights reserved.
 */
type TaskInfo = {
  executeFunc: (callback: (successful: boolean) => void) => any;
  retryForever?: boolean;
  retryTime?: number;
  jobId?: NodeJS.Timeout;
  isExecuting?: boolean;
  isDropt?: boolean;
};

export { TaskInfo };
