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
let presenceController: PresenceController;

describe('Presence Controller', () => {
  beforeEach(() => {
    presenceController = new PresenceController(5, _INTERVAL);
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should update caches when call saveToMemory()', () => {
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

  it('should remove id when call unsubscribe()', () => {
    presenceController.unsubscribe(1);
    expect(
      presenceController.getSubscribeController().removeId,
    ).toHaveBeenCalledWith(1);
  });

  it('should call subscribeSuccess() when success', () => {
    presenceController.handlePresenceIncomingData = jest.fn();
    presenceController.saveToMemory([{ id: 1, presence: PRESENCE.AVAILABLE }]);
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

  it('should call reset() when socket disconnect', () => {
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
    presenceController.reset();
    expect(presenceController.getCaches().size).toEqual(0);
  });

  it('should return data when call getById from memory', async () => {
    presenceController.saveToMemory([
      {
        id: 1,
        presence: PRESENCE.UNAVAILABLE,
      },
    ]);
    expect(await presenceController.getById(1)).toEqual({
      id: 1,
      presence: PRESENCE.UNAVAILABLE,
    });
  });

  it('should call api when call getById()', async () => {
    const id = 1;
    const p = await presenceController.getById(id);
    expect(p).toEqual({ id, presence: 'NotReady' });
    expect(
      presenceController.getSubscribeController().appendId,
    ).toHaveBeenCalledWith(1);
  });

  it('should clear caches when call reset() ', () => {
    presenceController
      .getCaches()
      .set(1, { id: 1, presence: PRESENCE.UNAVAILABLE });
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

    it('should return undefined when passing an empty array', async () => {
      const result = await presenceController.handlePresenceIncomingData([]);
      expect(result).toBeUndefined();
    });
    it('should call save and notify when passing an array', async () => {
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
  });

  describe('handleSocketStateChange', () => {
    it('should call reset() and notify reload when state changed to connected', () => {
      presenceController.reset = jest.fn();
      presenceController.handleSocketStateChange('connected');
      expect(presenceController.reset).toHaveBeenCalled();
      expect(notificationCenter.emitEntityReload).toHaveBeenCalled();
    });

    it('should call resetPresence() when state changed to connected', () => {
      presenceController.resetPresence = jest.fn();
      presenceController.handleSocketStateChange('disconnected');
      expect(presenceController.resetPresence).toHaveBeenCalled();
    });
  });

  describe('resetPresence', () => {
    it('should notify reset presence', () => {
      presenceController.resetPresence();
      expect(notificationCenter.emitEntityReset).toHaveBeenCalled();
    });
  });
});
