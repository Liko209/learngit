/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-05 16:13:08
 * Copyright © RingCentral. All rights reserved.
 */

import debounce from 'lodash/debounce';
import { SubscribeController } from '../SubscribeController';
import { SubscribeRequestController } from '../SubscribeRequestController';
import { RawPresence } from '../../entity';
import { PRESENCE } from '../../constant';

jest.mock('../SubscribeRequestController');
jest.mock('lodash/debounce', () => jest.fn(fn => fn));

const interval = 200;
let subscribeController: SubscribeController;

describe('presence subscribeHandler test', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    debounce.mockClear();
    subscribeController = new SubscribeController(5, () => {}, interval);
  });

  it('appendId()', () => {
    subscribeController.subscribeIds = jest.fn();
    subscribeController.subscribeIds.mockImplementation(() => {});

    subscribeController.failIds.set(2, 3);

    subscribeController.appendId(2);
    subscribeController.appendId(3);
    subscribeController.appendId(4);
    expect(subscribeController.failIds.get(2)).toBe(0);
    expect(subscribeController.queue).toEqual([2, 3, 4]);
    expect(subscribeController.subscribeIds).toHaveBeenCalledTimes(3);
    setTimeout(() => {
      expect(subscribeController.queue).toEqual([0]);
      expect(
        subscribeController.subscribeRequestController.execute,
      ).toHaveBeenCalledTimes(1);
    },         interval + 1);
  });

  describe('onSubscriptRequestFail()', () => {
    it('If socket not connect ids will into queue and subscribeIds again', () => {
      jest
        .spyOn(subscribeController, 'subscribeIds')
        .mockImplementation(() => {});
      subscribeController.queue = [];
      subscribeController.onSubscriptRequestFail([1, 2, 3], true);
      expect(subscribeController.subscribeIds).toHaveBeenCalledTimes(1);
      expect(subscribeController.queue).toEqual([1, 2, 3]);
    });

    it('workerFail()', () => {
      jest.spyOn(subscribeController.subscribeRequestController, 'execute');
      jest
        .spyOn(subscribeController, 'subscribeIds')
        .mockImplementation(() => {});
      subscribeController.queue = [4, 5, 6];
      subscribeController.onSubscriptRequestFail([1, 2, 3], false);
      subscribeController.onSubscriptRequestFail([1, 2, 3], false);
      subscribeController.onSubscriptRequestFail([1, 2, 3], false);
      expect(subscribeController.queue).toEqual([4, 5, 6]);

      subscribeController.onSubscriptRequestFail([1, 2, 3, 4], false);
      subscribeController.onSubscriptRequestFail([1, 2, 3, 4], false);
      subscribeController.onSubscriptRequestFail([1, 2, 3, 4], false);
      expect(subscribeController.queue).toEqual([5, 6]);
      expect(subscribeController.subscribeIds).toHaveBeenCalledTimes(6);
      setTimeout(() => {
        expect(
          subscribeController.subscribeRequestController.execute,
        ).toHaveBeenCalledTimes(1);
      },         interval + 1);
    });
  });

  it('workerSuccess()', () => {
    jest.spyOn(subscribeController, 'subscribeSuccess');
    jest.spyOn(subscribeController.subscribeRequestController, 'execute');
    jest
      .spyOn(subscribeController, 'subscribeIds')
      .mockImplementation(() => {});

    const mockRawPresence: RawPresence[] = [
      {
        personId: 1,
        calculatedStatus: PRESENCE.UNAVAILABLE,
      },
      {
        personId: 2,
        calculatedStatus: PRESENCE.AVAILABLE,
      },
      {
        personId: 3,
      },
    ];

    subscribeController.queue = [9, 10];
    subscribeController.onSubscribeRequestSuccess(mockRawPresence);
    expect(subscribeController.subscribeSuccess).toHaveBeenCalledWith([
      {
        personId: 1,
        calculatedStatus: 'Unavailable',
      },
      {
        personId: 2,
        calculatedStatus: 'Available',
      },
    ]);
    expect(subscribeController.queue).toEqual([3, 9, 10]);
    setTimeout(() => {
      expect(
        subscribeController.subscribeRequestController.execute,
      ).toHaveBeenCalledTimes(1);
    },         interval + 1);
  });

  it('removeId()', () => {
    subscribeController.queue = [1, 2];
    subscribeController.removeId(1);
    expect(subscribeController.queue).toEqual([2]);
  });

  it('reset()', () => {
    subscribeController.queue = [1, 2];
    subscribeController.reset();
    expect(subscribeController.queue).toEqual([]);
  });
});
