/**
 * @Author: Andy Hu
 * @Date:   2018-05-30T15:37:24+08:00
 * @Email:  andy.hu@ringcentral.com
 * @Project: Fiji
 * @Last modified by:   andy.hu
 * @Last modified time: 2018-06-13T10:22:24+08:00
 * @Copyright: © RingCentral. All rights reserve
 */

import { IResponse } from '../NetworkClient';
import Api from '../api';
import { InitialSearchParams, SearchResultResponse } from '../../service/search/types.d';
import { CancelRequestParam } from '../../service/search/types';

class SearchAPI extends Api {
  static basePath = '/search';
  static async search(params: InitialSearchParams | CancelRequestParam): Promise<IResponse<SearchResultResponse>> {
    return this.glipNetworkClient.get<SearchResultResponse>('/search', params);
  }
  static async scrollSearch(params: object): Promise<IResponse<SearchResultResponse>> {
    return this.glipNetworkClient.get<SearchResultResponse>('/search_scroll', params);
  }
}

export default SearchAPI;
