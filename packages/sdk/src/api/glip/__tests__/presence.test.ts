/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-08-31 14:16:00
 * Copyright © RingCentral. All rights reserved.
 */
import PresenceAPI from '../presence';
import Api from '../../api';
import { NETWORK_VIA } from 'foundation';

describe('PresenceAPI tests', () => {
  it('Get presence by ids', async () => {
    const spy = jest.spyOn(Api.glipNetworkClient, 'get');
    PresenceAPI.requestPresenceByIds([1, 2, 3, 4]);
    expect(spy).toHaveBeenCalledWith(
      '/glip-presence/v1/person/1,2,3,4/presence',
      {},
      NETWORK_VIA.SOCKET,
      {},
      {},
      3,
      undefined,
      undefined,
      undefined,
      Api.httpConfig.glip.presenceServer,
      '',
    );
  });
});
