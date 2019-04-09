/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-12 15:54:01
 * Copyright © RingCentral. All rights reserved.
 */

import Api from '../../api';
import {
  ContentSearchParams,
  ScrollSearchParams,
  InitialSearchResponse,
  ScrollSearchResponse,
} from './types';

class SearchAPI extends Api {
  static basePath = '/search';

  static async search(params: ContentSearchParams) {
    return this.glipNetworkClient.get<InitialSearchResponse>({
      params,
      path: '/search',
    });
  }

  static async scrollSearch(params: ScrollSearchParams) {
    return this.glipNetworkClient.get<ScrollSearchResponse>({
      params,
      path: '/search_scroll',
    });
  }
}

export { SearchAPI };
