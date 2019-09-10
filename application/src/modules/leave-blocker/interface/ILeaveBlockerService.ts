/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-02-12 15:25:22
 * Copyright © RingCentral. All rights reserved.
 */
import { createDecorator } from 'framework/ioc';

const ILeaveBlockerService = createDecorator('LEAVE_BLOCKER_SERVICE');

interface ILeaveBlockerService {
  onLeave(handler: () => boolean | undefined | null): void;
  offLeave(handler: () => boolean | undefined | null): void;
}

export { ILeaveBlockerService };
