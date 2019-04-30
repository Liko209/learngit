/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-21 18:13:00
 * Copyright © RingCentral. All rights reserved.
 */

import { PresenceService } from '../PresenceService';
import { PresenceController } from '../../controller/PresenceController';
import { PRESENCE } from '../../constant';

jest.mock('../../controller/PresenceController');

const _INTERVAL = 250;
const presenceService: PresenceService = new PresenceService(5, _INTERVAL);
const presenceController: PresenceController = new PresenceController(
  5,
  _INTERVAL,
);

describe('Presence Controller', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    Object.assign(presenceService, { _presenceController: presenceController });
  });

  it('should call saveToMemory() with correct parameter', () => {
    const presences = [
      {
        id: 1,
        presence: PRESENCE.UNAVAILABLE,
      },
      {
        id: 2,
        presence: PRESENCE.AVAILABLE,
      },
    ];
    presenceService.saveToMemory(presences);
    expect(presenceController.saveToMemory).toHaveBeenCalledWith([
      {
        id: 1,
        presence: PRESENCE.UNAVAILABLE,
      },
      {
        id: 2,
        presence: PRESENCE.AVAILABLE,
      },
    ]);
  });

  it('should call unsubscribe() with correct parameter', () => {
    presenceService.unsubscribe(1);
    expect(presenceController.unsubscribe).toHaveBeenCalledWith(1);
  });

  it('should call reset()', () => {
    presenceService.reset();
    expect(presenceController.reset).toHaveBeenCalled();
  });

  it('should call getById() with correct parameter', async () => {
    await presenceService.getById(1);
    expect(presenceController.getById).toHaveBeenCalledWith(1);
  });

  describe('presence handleData with correct parameter', () => {
    it('should call handlePresenceIncomingData', async () => {
      await presenceService.presenceHandleData([
        { personId: 1, calculatedStatus: PRESENCE.AVAILABLE },
      ]);
      expect(
        presenceController.handlePresenceIncomingData,
      ).toHaveBeenCalledWith(
        [
          {
            personId: 1,
            calculatedStatus: PRESENCE.AVAILABLE,
          },
        ],
        undefined,
      );
    });

    it('should call handleStore with correct parameter', () => {
      presenceService.handleSocketStateChange({ state: 'connected' });
      expect(presenceController.handleSocketStateChange).toHaveBeenCalledWith(
        'connected',
      );
    });

    it('should call handleStore with correct parameter', () => {
      presenceService.resetPresence();
      expect(presenceController.resetPresence).toHaveBeenCalled();
    });
  });
});
