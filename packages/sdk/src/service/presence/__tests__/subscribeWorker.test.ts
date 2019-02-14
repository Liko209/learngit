/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-05 16:13:19
 * Copyright © RingCentral. All rights reserved.
 */
import SubscribeWorker from '../subscribeWorker';
import PresenceAPI from '../../../api/glip/presence';
import socketManager from '../../socket';

jest.mock('../../../api/glip/presence');
jest.mock('../../socket');

const worker = new SubscribeWorker(() => {}, () => {});

describe('Presence subscribe worker', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    socketManager.isConnected.mockImplementation(() => true);
  });

  it('socket disconnect', async () => {
    socketManager.isConnected.mockImplementation(() => false);
    jest.spyOn(worker, 'failCallback');
    jest.spyOn(worker, 'successCallback');

    await worker.execute([1, 2]);
    expect(worker.failCallback).not.toHaveBeenCalled();
    expect(worker.successCallback).not.toHaveBeenCalled();
  });
  it('execute success', async () => {
    const data = [
      {
        personId: 1,
        calculatedStatus: 'Unavailable',
      },
      {
        personId: 2,
        calculatedStatus: 'Available',
      },
    ];
    PresenceAPI.requestPresenceByIds.mockImplementation(() => {
      return new Promise((resolve: any) => {
        resolve(data);
      });
    });
    jest.spyOn(worker, 'successCallback');
    await worker.execute([1, 2, 3]);
    expect(worker.successCallback).toHaveBeenCalledWith(data);
  });

  it('execute failCallback', async () => {
    PresenceAPI.requestPresenceByIds.mockImplementation(() => {
      return new Promise((resolve, reject) => {
        reject(new Error('server 5xx'));
      });
    });
    jest.spyOn(worker, 'failCallback');
    await worker.execute([1, 2, 3]);
    expect(worker.failCallback).toHaveBeenCalledWith([1, 2, 3]);
  });
});
