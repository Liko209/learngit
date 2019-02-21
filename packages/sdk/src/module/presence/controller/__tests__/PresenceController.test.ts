/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-05 16:15:38
 * Copyright © RingCentral. All rights reserved.
 */
import { PresenceController } from '../PresenceController';
import notificationCenter from '../../../../service/notificationCenter';
import { ENTITY } from '../../../../service/eventKey';
import { PRESENCE } from '../../constant';

jest.mock('../SubscribeController');
jest.mock('../../../../service/notificationCenter');

const _INTERVAL = 250;
let presenceController: PresenceController = new PresenceController(
  5,
  _INTERVAL,
);

describe('Presence Controller', () => {
  beforeEach(() => {
    presenceController.reset();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('saveToMemory()', () => {
    presenceController.saveToMemory([
      {
        id: 1,
        presence: PRESENCE.UNAVAILABLE,
      },
      {
        id: 2,
        presence: PRESENCE.AVAILABLE,
      },
    ]);
    expect(presenceController.getCaches().get(1)).toEqual({
      id: 1,
      presence: 'Unavailable',
    });
    expect(presenceController.getCaches().get(2)).toEqual({
      id: 2,
      presence: 'Available',
    });
  });

  it('unsubscribe()', () => {
    presenceController.unsubscribe(1);
    expect(
      presenceController.getSubscribeController().removeId,
    ).toHaveBeenCalledWith(1);
  });

  it('subscribeSuccess()', () => {
    presenceController.handlePresenceIncomingData = jest.fn();
    presenceController.saveToMemory([{ id: 1, presence: 'Available' }]);
    presenceController.subscribeSuccess([
      {
        personId: 1,
        calculatedStatus: PRESENCE.UNAVAILABLE,
      },
      {
        personId: 2,
        calculatedStatus: PRESENCE.AVAILABLE,
      },
    ]);
    expect(presenceController.handlePresenceIncomingData).toHaveBeenCalledWith([
      {
        personId: 2,
        calculatedStatus: PRESENCE.AVAILABLE,
      },
    ]);
  });

  it('If socket disconnect need to reset', () => {
    presenceController.saveToMemory([
      {
        id: 1,
        presence: 'Unavailable',
      },
      {
        id: 2,
        presence: 'Available',
      },
    ]);
    presenceController.reset();
    expect(presenceController.getCaches().size).toEqual(0);
  });

  it('getById from memory', async () => {
    presenceController.saveToMemory([
      {
        id: 1,
        presence: 'Unavailable',
      },
    ]);
    expect(await presenceController.getById(1)).toEqual({
      id: 1,
      presence: 'Unavailable',
    });
  });

  it('getById from api', async () => {
    const id = 1;
    const p = await presenceController.getById(id);
    expect(p).toEqual({ id, presence: 'NotReady' });
    expect(
      presenceController.getSubscribeController().appendId,
    ).toHaveBeenCalledWith(1);
  });

  it('reset()', () => {
    presenceController.getCaches().set(1, { id: 1, presence: 'Unavailable' });
    presenceController.reset();
    expect(presenceController.getCaches().size).toBe(0);
    expect(
      presenceController.getSubscribeController().reset,
    ).toHaveBeenCalled();
  });

  describe('presence handleData', () => {
    beforeEach(() => {
      presenceController.reset();
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it('passing an empty array', async () => {
      const result = await presenceController.handlePresenceIncomingData([]);
      expect(result).toBeUndefined();
    });
    it('passing an array', async () => {
      presenceController = new PresenceController(5, _INTERVAL);
      presenceController.reset();
      presenceController.saveToMemory = jest.fn();
      await presenceController.handlePresenceIncomingData([
        { personId: 1, calculatedStatus: PRESENCE.AVAILABLE },
      ]);
      expect(presenceController.saveToMemory).toHaveBeenCalledWith([
        {
          id: 1,
          presence: PRESENCE.AVAILABLE,
        },
      ]);
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledWith(
        ENTITY.PRESENCE,
        [
          {
            id: 1,
            presence: PRESENCE.AVAILABLE,
          },
        ],
      );
    });

    it('handleStore', () => {
      presenceController.handleStore({ state: 'connected' });
      presenceController.handleStore({ state: 'disconnected' });
      expect(notificationCenter.emitEntityReload).toHaveBeenCalled();
      expect(
        presenceController.getSubscribeController().reset,
      ).toHaveBeenCalled();
      expect(notificationCenter.emitEntityReset).toHaveBeenCalled();
    });
  });
});
