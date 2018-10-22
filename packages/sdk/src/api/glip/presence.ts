/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-08-29 11:09:48
 * Copyright © RingCentral. All rights reserved.
 */

import { IResponse } from '../NetworkClient';
import Api from '../api';
import { RawPresence } from '../../models';
import { NETWORK_VIA } from 'foundation';

class PresenceAPI extends Api {
  /**
   * @param {*} idsArr  presence ids
   * return presences or null
   */
  static requestPresenceByIds(
    idArr: number[],
  ): Promise<IResponse<RawPresence[]>> {
    const ids = idArr.join(',');
    return this.glipNetworkClient.get(
      `/glip-presence/v1/person/${ids}/presence`,
      {},
      NETWORK_VIA.SOCKET,
      {},
      {},
      3,
    );
  }
}

export default PresenceAPI;
