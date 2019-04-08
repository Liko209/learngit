/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-08-31 14:16:00
 * Copyright © RingCentral. All rights reserved.
 */
import PresenceAPI from '../presence';
import { NETWORK_VIA } from 'foundation';

jest.mock('../../api');

describe('PresenceAPI tests', () => {
  it('Get presence by ids', async () => {
    PresenceAPI.requestPresenceByIds([1, 2, 3, 4]);
    expect(PresenceAPI.uploadNetworkClient.get).toHaveBeenCalledWith({
      path: '/glip-presence/v1/person/1,2,3,4/presence',
      via: NETWORK_VIA.SOCKET,
      retryCount: 3,
    });
  });
});
