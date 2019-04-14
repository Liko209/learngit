/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-02-02 14:33:10
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { ILeaveBlockerService } from '../interface';

type LeaveHandler = () => boolean;

class LeaveBlockerService implements ILeaveBlockerService {
  handlers: LeaveHandler[] = [];

  init() {
    window.onbeforeunload = () => {
      return this.handlers.some((handler: LeaveHandler) => handler())
        ? true
        : undefined;
    };
  }

  dispose() {
    window.onbeforeunload = null;
  }

  onLeave(handler: LeaveHandler) {
    this.handlers.push(handler);
  }

  offLeave(handler: LeaveHandler) {
    _.remove(this.handlers, handler);
  }
}

export { LeaveBlockerService, LeaveHandler };
