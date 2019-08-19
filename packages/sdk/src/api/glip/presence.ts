/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-08-29 11:09:48
 * Copyright © RingCentral. All rights reserved.
 */

import Api from '../api';
import { RawPresence } from '../../module/presence/entity';
import { NETWORK_VIA } from 'foundation/network';
import { Presence } from 'sdk/module/presence/entity/Presence';
import { PRESENCE_REQUEST_STATUS } from 'sdk/module/presence/constant';

class PresenceAPI extends Api {
  /**
   * @param {*} idsArr  presence ids
   * return presences or null
   */
  static requestPresenceByIds(idArr: number[]) {
    const ids = idArr.join(',');
    return PresenceAPI.glipNetworkClient.get<RawPresence[]>({
      path: `/glip-presence/v1/person/${ids}/presence`,
      via: NETWORK_VIA.SOCKET,
      retryCount: 3,
      host: Api.httpConfig.glip.presenceServer,
      pathPrefix: '',
    });
  }

  static setPresence(presence: Presence) {
    return PresenceAPI.glipNetworkClient.post<Presence>({
      path: `/glip-presence/v1/person/${presence.id}/set-status`,
      via: NETWORK_VIA.SOCKET,
      host: Api.httpConfig.glip.presenceServer,
      pathPrefix: '',
      data: {
        status: presence.presence,
      },
    });
  }

  static setAutoPresence(presence: PRESENCE_REQUEST_STATUS) {
    return PresenceAPI.glipNetworkClient.post<Presence>({
      path: '/set_presence',
      via: NETWORK_VIA.SOCKET,
      host: Api.httpConfig.glip.presenceServer,
      data: {
        presence,
      },
    });
  }
}

export default PresenceAPI;
