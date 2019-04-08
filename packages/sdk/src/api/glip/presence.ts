/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-08-29 11:09:48
 * Copyright © RingCentral. All rights reserved.
 */

import Api from '../api';
import { RawPresence } from '../../module/presence/entity';
import { NETWORK_VIA } from 'foundation';

class PresenceAPI extends Api {
  /**
   * @param {*} idsArr  presence ids
   * return presences or null
   */
  static requestPresenceByIds(idArr: number[]) {
    const ids = idArr.join(',');
    return this.uploadNetworkClient.get<RawPresence[]>({
      path: `/glip-presence/v1/person/${ids}/presence`,
      via: NETWORK_VIA.SOCKET,
      retryCount: 3,
    });
  }
}

export default PresenceAPI;
