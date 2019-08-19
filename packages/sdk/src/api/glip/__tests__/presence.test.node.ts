/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-08-31 14:16:00
 * Copyright © RingCentral. All rights reserved.
 */
import PresenceAPI from '../presence';
import Api from '../../api';
import { NETWORK_VIA } from 'foundation/network';
import { PRESENCE } from 'sdk/module/presence/constant';
import { PRESENCE_REQUEST_STATUS } from 'sdk/module/presence/constant/Presence';

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

  it('should call post method with correct parameters', async () => {
    const spy = jest.spyOn(Api.glipNetworkClient, 'post');
    PresenceAPI.setAutoPresence(PRESENCE_REQUEST_STATUS.AWAY);
    expect(spy).toHaveBeenCalledWith({
      path: '/set_presence',
      via: NETWORK_VIA.SOCKET,
      host: Api.httpConfig.glip.presenceServer,
      data: {
        presence: PRESENCE_REQUEST_STATUS.AWAY,
      },
    });
  });
});
