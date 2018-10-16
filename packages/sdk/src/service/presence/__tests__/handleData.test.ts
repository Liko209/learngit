/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-05 16:15:33
 * Copyright © RingCentral. All rights reserved.
 */
import serviceManager from '../../../service/serviceManager';
import PresenceService from '../../../service/presence/index';
import { presenceHandleData, handleStore } from '../handleData';
import notificationCenter from '../../notificationCenter';
import { ENTITY } from '../../eventKey';

jest.mock('../../notificationCenter');

jest.mock('../../../service/serviceManager', () => {
  const instance = { saveToMemory: jest.fn() };
  return {
    getInstance: () => instance,
  };
});

jest.mock('../../../service/presence/index', () => {
  const instance = { saveToMemory: jest.fn() };
  return {
    getInstance: () => instance,
  };
});

describe('presence handleData', () => {
  it('passing an empty array', async () => {
    const result = await presenceHandleData([]);
    expect(result).toBeUndefined();
  });
  it('passing an array', async () => {
    await presenceHandleData([{ personId: 1, calculatedStatus: 'Available' }]);
    const instance = serviceManager.getInstance(PresenceService);
    expect(instance.saveToMemory).toHaveBeenCalledWith([
      {
        id: 1,
        presence: 'online',
      },
    ]);
    expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledWith(
      ENTITY.PRESENCE,
      [
        {
          id: 1,
          presence: 'online',
        },
      ],
    );
  });

  it('handleStore', () => {
    handleStore({ state: 'connected' });
    handleStore({ state: 'disconnected' });
    expect(notificationCenter.emitEntityReload).toHaveBeenCalled();
    expect(notificationCenter.emitEntityReset).toHaveBeenCalled();
  });
});
