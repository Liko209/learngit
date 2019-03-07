/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-22 09:12:19
 * Copyright © RingCentral. All rights reserved.
 */

import { RecentSearchRecordController } from './RecentSearchRecordController';
class SearchServiceController {
  private _recentSearchRecordController: RecentSearchRecordController;
  constructor() {}

  get recentSearchRecordController() {
    if (!this._recentSearchRecordController) {
      this._recentSearchRecordController = new RecentSearchRecordController();
    }
    return this._recentSearchRecordController;
  }
}

export { SearchServiceController };
