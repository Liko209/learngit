/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-22 09:12:19
 * Copyright © RingCentral. All rights reserved.
 */

import { RecentSearchRecordController } from './RecentSearchRecordController';
import { SearchPersonController } from './SearchPersonController';
import { ISearchService } from '../service/ISearchService';

class SearchServiceController {
  private _recentSearchRecordController: RecentSearchRecordController;
  private _searchPersonController: SearchPersonController;
  private _searchService: ISearchService;

  constructor(searchService: ISearchService) {
    this._searchService = searchService;
  }

  get recentSearchRecordController() {
    if (!this._recentSearchRecordController) {
      this._recentSearchRecordController = new RecentSearchRecordController();
    }
    return this._recentSearchRecordController;
  }

  get searchPersonController() {
    if (!this._searchPersonController) {
      this._searchPersonController = new SearchPersonController(
        this._searchService,
      );
    }
    return this._searchPersonController;
  }
}

export { SearchServiceController };
