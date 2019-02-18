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
  value: boolean | undefined | null;
  init() {
    window.onbeforeunload = () => {
      this.emit(LEAVE_EVENT);
      return this.value ? true : undefined;
    };
  }

  dispose() {
    window.onbeforeunload = null;
  }

  onLeave(handler: () => boolean | undefined | null) {
    return this.on(LEAVE_EVENT, () => {
      this.value = handler();
    });
  }

  offLeave(handler: () => boolean | undefined | null) {
    return this.off(LEAVE_EVENT, handler);
  }
}

export { LeaveBlockerService };
