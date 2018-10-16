/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-05 10:05:20
 * Copyright © RingCentral. All rights reserved.
 */
import debounce from 'lodash/debounce';
import { RawPresence } from '../../models';
import Worker from './subscribeWorker';

class SubscribeHandler {
  public subscribeSuccess: Function;
  public queue: number[];
  public worker: Worker;
  public subscribeIds: Function;

  constructor(
    threshold: number,
    subscribeSuccess: Function,
    interval: number = 200,
  ) {
    this.queue = [];
    this.subscribeSuccess = subscribeSuccess;
    this.worker = new Worker(this.workerSuccess, this.workerFail);
    this.subscribeIds = debounce(async () => {
      const ids: number[] = this.queue.splice(threshold, threshold);
      await this.worker.execute(ids);
    },                           interval);
  }

  appendId(id: number) {
    this.queue.push(id);
    this.subscribeIds();
  }

  workerFail(ids: number[]) {
    this.queue.unshift(...ids);
  }

  workerSuccess(RawPresence: RawPresence[]) {
    const successArr: RawPresence[] = [];
    RawPresence.forEach((presence: RawPresence) => {
      if (presence.calculatedStatus) {
        successArr.push(presence);
      } else {
        this.queue.unshift(presence.personId);
      }
    });

    this.subscribeSuccess(successArr);
    this.subscribeIds();
  }

  removeId(id: number) {
    const idx = this.queue.indexOf(id);
    if (idx > -1) {
      this.queue.splice(idx, 1);
    }
  }

  reset() {
    this.queue = [];
  }
}

export default SubscribeHandler;
