/*
 * @Author: Andy Hu
 * @Date: 2018-06-14 23:05:37
 * Copyright © RingCentral. All rights reserved.
 */

import SearchAPI from '../search';
import Api from '../../api';

jest.mock('../../api');

describe('SearchAPI', () => {
  describe('search()', () => {
    it('glipNetworkClient should be called with params', () => {
      const params = {
        client_request_id: 2,
        previous_server_request_id: 29922267,
        q: 'andy',
        request_id: 83,
        scroll_size: 10,
        type: 'links'
      };
      SearchAPI.search(params);
      expect(Api.glipNetworkClient.get).toHaveBeenCalledWith(SearchAPI.basePath, params);
    });
  });
  describe('scrollSearch()', () => {
    it('glipNetworkClient should be called with params', () => {
      const params = {
        client_request_id: 2,
        previous_server_request_id: 29922267,
        q: 'andy',
        request_id: 83,
        scroll_size: 10,
        type: 'links'
      };
      SearchAPI.scrollSearch(params);
      expect(Api.glipNetworkClient.get).toHaveBeenCalledWith(SearchAPI.basePath, params);
    });
  });
});
