/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-02-02 14:33:10
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { EventEmitter2 } from 'eventemitter2';
import { ILeaveBlockerService } from '../interface';

const LEAVE_EVENT = 'leave';

class LeaveBlockerService extends EventEmitter2
  implements ILeaveBlockerService {
  queue: (() => boolean)[] = [];
  init() {
    window.onbeforeunload = () => {
      this.emit(LEAVE_EVENT);
      return this.queue.some(handler => handler()) ? true : undefined;
    };
  }

  dispose() {
    window.onbeforeunload = null;
    this.queue = [];
  }

  onLeave(handler: () => boolean) {
    return this.on(LEAVE_EVENT, () => {
      this.queue.push(handler);
    });
  }

  offLeave(handler: () => boolean) {
    return this.off(LEAVE_EVENT, () => {
      const index = this.queue.indexOf(handler);
      this.queue.splice(index, 1);
    });
  }
}

export { LeaveBlockerService };
