/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-05 16:13:19
 * Copyright © RingCentral. All rights reserved.
 */
import { SubscribeRequestController } from '../SubscribeRequestController';
import PresenceAPI from '../../../../api/glip/presence';
import { ApiResultOk } from '../../../../api/';
import socketManager from '../../../../service/socket';
import { PRESENCE } from '../../constant';

jest.mock('../../../../api/glip/presence');
jest.mock('../../../../service/socket');

const subscribeRequestController = new SubscribeRequestController(
  () => {},
  () => {},
);

describe('Presence subscribe worker', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    socketManager.isConnected.mockImplementation(() => true);
  });

  it('socket disconnect', async () => {
    socketManager.isConnected.mockImplementation(() => false);
    jest.spyOn(subscribeRequestController, 'failCallback');
    jest.spyOn(subscribeRequestController, 'successCallback');

    await subscribeRequestController.execute([1, 2]);
    expect(subscribeRequestController.failCallback).toHaveBeenCalledWith(
      [1, 2],
      true,
    );
    expect(subscribeRequestController.successCallback).not.toHaveBeenCalled();
  });
  it('execute success', async () => {
    const data = [
      {
        personId: 1,
        calculatedStatus: PRESENCE.UNAVAILABLE,
      },
      {
        personId: 2,
        calculatedStatus: PRESENCE.AVAILABLE,
      },
    ];
    PresenceAPI.requestPresenceByIds.mockImplementation(() => {
      return new Promise((resolve: any) => {
        resolve(data);
      });
    });
    jest.spyOn(subscribeRequestController, 'successCallback');
    await subscribeRequestController.execute([1, 2, 3]);
    expect(subscribeRequestController.successCallback).toHaveBeenCalledWith(
      data,
    );
  });

  it('execute failCallback', async () => {
    PresenceAPI.requestPresenceByIds.mockImplementation(() => {
      return new Promise((resolve, reject) => {
        reject(new Error('server 5xx'));
      });
    });
    jest.spyOn(subscribeRequestController, 'failCallback');
    await subscribeRequestController.execute([1, 2, 3]);
    expect(subscribeRequestController.failCallback).toHaveBeenCalledWith(
      [1, 2, 3],
      false,
    );
  });
});
