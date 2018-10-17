/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-05 16:13:08
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../__tests__/types.d.ts" />

import debounce from 'lodash/debounce';
import SubscribeHandler from '../subscribeHandler';
import SubscribeWorker from '../subscribeWorker';
import { presenceHandleData } from '../handleData';
import { RawPresence } from '../../../models';

jest.mock('../subscribeWorker');
jest.mock('../handleData');
jest.mock('lodash/debounce', () => jest.fn(fn => fn));

const interval = 200;
const subscribeHandler = new SubscribeHandler(5, () => {}, interval);

describe('presence subscribeHandler test', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    subscribeHandler.reset();
    debounce.mockClear();
  });

  it('appendId()', () => {
    jest.spyOn(subscribeHandler, 'subscribeIds');
    jest.spyOn(subscribeHandler.worker, 'execute');
    subscribeHandler.subscribeIds.mockImplementation(() => {});
    subscribeHandler.failIds.set(2, 3);

    subscribeHandler.appendId(2);
    subscribeHandler.appendId(3);
    subscribeHandler.appendId(4);
    expect(subscribeHandler.failIds.get(2)).toBe(0);
    expect(subscribeHandler.queue).toEqual([2, 3, 4]);
    expect(subscribeHandler.subscribeIds).toHaveBeenCalledTimes(3);
    setTimeout(() => {
      expect(subscribeHandler.queue).toEqual([0]);
      expect(subscribeHandler.worker.execute).toHaveBeenCalledTimes(1);
    },         interval + 1);
  });

  it('workerFail()', () => {
    jest.spyOn(subscribeHandler.worker, 'execute');
    jest.spyOn(subscribeHandler, 'subscribeIds').mockImplementation(() => {});
    subscribeHandler.queue = [4, 5, 6];
    subscribeHandler.workerFail([1, 2, 3]);
    subscribeHandler.workerFail([1, 2, 3]);
    subscribeHandler.workerFail([1, 2, 3]);
    expect(subscribeHandler.queue).toEqual([4, 5, 6]);

    subscribeHandler.workerFail([1, 2, 3, 4]);
    subscribeHandler.workerFail([1, 2, 3, 4]);
    subscribeHandler.workerFail([1, 2, 3, 4]);
    expect(subscribeHandler.queue).toEqual([5, 6]);
    expect(subscribeHandler.subscribeIds).toHaveBeenCalledTimes(6);
    setTimeout(() => {
      expect(subscribeHandler.worker.execute).toHaveBeenCalledTimes(1);
    },         interval + 1);
  });

  it('workerSuccess()', () => {
    jest.spyOn(subscribeHandler, 'subscribeSuccess');
    jest.spyOn(subscribeHandler.worker, 'execute');
    jest.spyOn(subscribeHandler, 'subscribeIds').mockImplementation(() => {});

    const mockRawPresence: RawPresence[] = [
      {
        personId: 1,
        calculatedStatus: 'Unavailable',
      },
      {
        personId: 2,
        calculatedStatus: 'Available',
      },
      {
        personId: 3,
      },
    ];

    subscribeHandler.queue = [9, 10];
    subscribeHandler.workerSuccess(mockRawPresence);
    expect(subscribeHandler.subscribeSuccess).toHaveBeenCalledWith([
      {
        personId: 1,
        calculatedStatus: 'Unavailable',
      },
      {
        personId: 2,
        calculatedStatus: 'Available',
      },
    ]);
    expect(subscribeHandler.queue).toEqual([3, 9, 10]);
    setTimeout(() => {
      expect(subscribeHandler.worker.execute).toHaveBeenCalledTimes(1);
    },         interval + 1);
  });

  it('removeId()', () => {
    subscribeHandler.queue = [1, 2];
    subscribeHandler.removeId(1);
    expect(subscribeHandler.queue).toEqual([2]);
  });

  it('reset()', () => {
    subscribeHandler.queue = [1, 2];
    subscribeHandler.reset();
    expect(subscribeHandler.queue).toEqual([]);
  });
});
