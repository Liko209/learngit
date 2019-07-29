/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-08-31 14:16:00
 * Copyright © RingCentral. All rights reserved.
 */
import PresenceAPI from '../presence';
import Api from '../../api';
import { NETWORK_VIA } from 'foundation';
import { PRESENCE } from 'sdk/module/presence/constant';

jest.mock('../../NetworkClient');

describe('PresenceAPI tests', () => {
  it('Get presence by ids', async () => {
    const spy = jest.spyOn(Api.glipNetworkClient, 'get');
    PresenceAPI.requestPresenceByIds([1, 2, 3, 4]);
    expect(spy).toHaveBeenCalledWith({
      path: '/glip-presence/v1/person/1,2,3,4/presence',
      via: NETWORK_VIA.SOCKET,
      retryCount: 3,
      host: Api.httpConfig.glip.presenceServer,
      pathPrefix: '',
    });
  });

  it('set presence', async () => {
    const spy = jest.spyOn(Api.glipNetworkClient, 'post');
    const id = 1;
    PresenceAPI.setPresence({
      id,
      presence: PRESENCE.DND,
    });
    expect(spy).toHaveBeenCalledWith({
      path: `/glip-presence/v1/person/${id}/set-status`,
      via: NETWORK_VIA.SOCKET,
      host: Api.httpConfig.glip.presenceServer,
      pathPrefix: '',
      data: {
        status: PRESENCE.DND,
      },
    });
  });
});
