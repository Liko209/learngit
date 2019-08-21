/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-17 14:53:50
 * Copyright © RingCentral. All rights reserved.
 */

import Api from '../../../api';
import { SearchAPI } from '../search';
import { NETWORK_VIA } from 'foundation/network';

jest.mock('../../../api');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('SearchAPI', () => {
  beforeEach(() => {
    clearMocks();
  });
  describe('search', () => {
    beforeEach(() => {
      clearMocks();
    });

    it('should request via socket', () => {
      const spy = jest.spyOn(Api.glipNetworkClient, 'get');
      const params = { id: 1 } as any;
      SearchAPI.search(params);
      expect(spy).toHaveBeenCalledWith({
        params,
        path: '/search',
        via: NETWORK_VIA.SOCKET,
      });
    });
  });

  describe('scrollSearch', () => {
    beforeEach(() => {
      clearMocks();
    });

    it('should request via socket', () => {
      const spy = jest.spyOn(Api.glipNetworkClient, 'get');
      const params = { id: 1 } as any;
      SearchAPI.scrollSearch(params);
      expect(spy).toHaveBeenCalledWith({
        params,
        path: '/search_scroll',
        via: NETWORK_VIA.SOCKET,
      });
    });
  });
});
