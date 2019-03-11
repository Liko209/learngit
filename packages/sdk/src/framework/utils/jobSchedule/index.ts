/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-04 20:27:38
 * Copyright © RingCentral. All rights reserved.
 */

import { JobScheduler } from './JobScheduler';

const jobScheduler = new JobScheduler();

export { jobScheduler };
export { JobInfo } from './types';
export { JOB_KEY } from './constants';
