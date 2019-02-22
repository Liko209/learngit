/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-22 09:04:59
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractService } from '../../../framework/service/AbstractService';
import { ISearchService } from './ISearchService';
import { RecentSearchModel } from '../entity';
import { SearchServiceController } from '../controller/SearchServiceController';
import { container } from '../../../container';

class SearchService extends AbstractService implements ISearchService {
  static serviceName = 'SearchService';
  private _searchServiceController = new SearchServiceController();
  constructor() {
    super();
  }
  protected onStarted() {}
  protected onStopped() {}

  get recentSearchRecordController() {
    return this._searchServiceController.recentSearchRecordController;
  }

  addRecentSearchRecord(model: RecentSearchModel) {
    this.recentSearchRecordController.addRecentSearchRecord(model);
  }

  clearRecentSearchRecords() {
    this.recentSearchRecordController.clearRecentSearchRecords();
  }

  getRecentSearchRecords(): RecentSearchModel[] {
    return this.recentSearchRecordController.getRecentSearchRecords();
  }

  removeRecentSearchRecords(ids: Set<number>) {
    return this.recentSearchRecordController.removeRecentSearchRecords(ids);
  }

  static getInstance(): SearchService {
    return container.get(this.name);
  }
}

export { SearchService };
