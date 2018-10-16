/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-05 16:15:38
 * Copyright © RingCentral. All rights reserved.
 */
import PresenceService from '../index';
import SubscribeHandler from '../subscribeHandler';
import { RawPresence } from '../../../models';
import { presenceHandleData } from '../handleData';
import notificationCenter from '../../notificationCenter';
import { SOCKET, SERVICE } from '../../eventKey';
import dataDispatcher from '../../../component/DataDispatcher';

jest.mock('../subscribeHandler');
jest.mock('../handleData');

const _INTERVAL = 250;
const presenceService: PresenceService = new PresenceService(5, _INTERVAL);

describe('Presence service', () => {
  beforeEach(() => {
    presenceService.reset();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('saveToMemory()', () => {
    presenceService.saveToMemory([
      {
        id: 1,
        presence: 'Unavailable',
      },
      {
        id: 2,
        presence: 'Available',
      },
    ]);
    expect(presenceService.caches.get(1)).toEqual({
      id: 1,
      presence: 'Unavailable',
    });
    expect(presenceService.caches.get(2)).toEqual({
      id: 2,
      presence: 'Available',
    });
  });

  it('unsubscribe()', () => {
    presenceService.unsubscribe(1);
    expect(presenceService.subscribeHandler.removeId).toHaveBeenCalledWith(1);
  });

  it('subscribeSuccess()', () => {
    presenceService.saveToMemory([{ id: 1, presence: 'Available' }]);
    presenceService.subscribeSuccess([
      {
        personId: 1,
        calculatedStatus: 'Unavailable',
      },
      {
        personId: 2,
        calculatedStatus: 'Available',
      },
    ]);
    expect(presenceHandleData).toHaveBeenCalledWith([
      {
        personId: 2,
        calculatedStatus: 'Available',
      },
    ]);
  });

  it('If socket disconnect need to reset', () => {
    presenceService.saveToMemory([
      {
        id: 1,
        presence: 'Unavailable',
      },
      {
        id: 2,
        presence: 'Available',
      },
    ]);
    presenceService.reset();
    expect(presenceService.caches.size).toEqual(0);
  });

  it('getById from memory', async () => {
    presenceService.saveToMemory([
      {
        id: 1,
        presence: 'Unavailable',
      },
    ]);
    expect(await presenceService.getById(1)).toEqual({
      id: 1,
      presence: 'Unavailable',
    });
  });

  it('getById from api', async () => {
    const id = 1;
    const p = await presenceService.getById(id);
    expect(p).toEqual({ id, presence: 'not_ready' });
    expect(presenceService.subscribeHandler.appendId).toHaveBeenCalledWith(1);
  });

  it('reset()', () => {
    presenceService.caches.set(1, { id: 1, presence: 'Unavailable' });
    presenceService.reset();
    expect(presenceService.caches.size).toBe(0);
    expect(presenceService.subscribeHandler.reset).toHaveBeenCalled();
  });
});
