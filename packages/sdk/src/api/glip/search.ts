/**
 * @Author: Andy Hu
 * @Date:   2018-05-30T15:37:24+08:00
 * @Email:  andy.hu@ringcentral.com
 * @Project: Fiji
 * @Last modified by:   andy.hu
 * @Last modified time: 2018-06-13T10:22:24+08:00
 * @Copyright: © RingCentral. All rights reserve
 */

import { Result } from 'foundation';
import Api from '../api';
import {
  InitialSearchParams,
  SearchResult,
} from '../../service/search/types.d';
import { CancelRequestParam } from '../../service/search/types';

type SearchParams = InitialSearchParams | CancelRequestParam;
type SearchResponse = Result<SearchResult>;

class SearchAPI extends Api {
  static basePath = '/search';
  static async search(params: SearchParams) {
    return this.glipNetworkClient.get<SearchResult>('/search', params);
  }
  static async scrollSearch(params: object) {
    return this.glipNetworkClient.get<SearchResult>('/search_scroll', params);
  }
}

export default SearchAPI;
export { SearchParams, SearchResponse };
