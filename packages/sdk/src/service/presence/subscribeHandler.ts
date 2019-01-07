/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-05 10:05:20
 * Copyright © RingCentral. All rights reserved.
 */
import debounce from 'lodash/debounce';
import { RawPresence } from '../../module/presence/entity';
import Worker from './subscribeWorker';

const RETRY_COUNT = 2;

class SubscribeHandler {
  public queue: number[];
  public worker: Worker;
  public subscribeIds: Function;
  public failIds: Map<number, number>;

  constructor(
    threshold: number,
    public subscribeSuccess: Function,
    interval: number = 200,
  ) {
    this.queue = [];
    this.failIds = new Map();
    this.worker = new Worker(
      this.workerSuccess.bind(this),
      this.workerFail.bind(this),
    );
    this.subscribeIds = debounce(async () => {
      const ids: number[] = this.queue.splice(-threshold, threshold);
      await this.worker.execute(ids);
    },                           interval);
  }

  appendId(id: number) {
    this.queue.push(id);
    if (this.failIds.has(id)) {
      this.failIds.set(id, 0);
    }
    this.subscribeIds();
  }

  workerFail(ids: number[]) {
    ids.forEach((id: number) => {
      // avoid endless loop request ids
      // id if count > 3  need throw
      let count: number = this.failIds.get(id) || 0;
      const index = this.queue.indexOf(id);
      if (count >= RETRY_COUNT) {
        if (index > -1) {
          this.queue.splice(index, 1);
        }
      } else {
        this.failIds.set(id, ++count);
        if (index < 0) {
          this.queue.unshift(id);
        }
      }
    });
    this.subscribeIds();
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
    this.failIds = new Map();
  }
}

export default SubscribeHandler;
