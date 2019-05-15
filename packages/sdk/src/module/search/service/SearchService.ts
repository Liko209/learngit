/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-22 09:04:59
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractService } from '../../../framework/service/AbstractService';
import { ISearchService } from './ISearchService';
import {
  RecentSearchTypes,
  RecentSearchModel,
  FuzzySearchPersonOptions,
} from '../entity';
import { SearchServiceController } from '../controller/SearchServiceController';
import { container } from '../../../container';
import { Person } from '../../person/entity';
import { SortableModel } from '../../../framework/model';
import { SearchUserConfig } from '../config';

class SearchService extends AbstractService implements ISearchService {
  private _searchServiceController: SearchServiceController = new SearchServiceController(
    this,
  );
  private _userConfig: SearchUserConfig;

  constructor() {
    super();
  }
  protected onStarted() {}
  protected onStopped() {}

  private get recentSearchRecordController() {
    return this._searchServiceController.recentSearchRecordController;
  }

  private get searchPersonController() {
    return this._searchServiceController.searchPersonController;
  }

  get userConfig() {
    if (!this._userConfig) {
      this._userConfig = new SearchUserConfig();
    }
    return this._userConfig;
  }

  addRecentSearchRecord(
    type: RecentSearchTypes,
    value: string | number,
    params = {},
  ) {
    this.recentSearchRecordController.addRecentSearchRecord(
      type,
      value,
      params,
    );
  }

  clearRecentSearchRecords() {
    this.recentSearchRecordController.clearRecentSearchRecords();
  }

  getRecentSearchRecords(): RecentSearchModel[] {
    return this.recentSearchRecordController.getRecentSearchRecords();
  }

  getRecentSearchRecordsByType(type: RecentSearchTypes) {
    return this.recentSearchRecordController.getRecentSearchRecordsByType(type);
  }

  removeRecentSearchRecords(ids: Set<number>) {
    return this.recentSearchRecordController.removeRecentSearchRecords(ids);
  }

  static getInstance(): SearchService {
    return container.get(this.name);
  }

  async doFuzzySearchPersons(
    options: FuzzySearchPersonOptions,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Person>[];
  } | null> {
    return await this.searchPersonController.doFuzzySearchPersons(options);
  }
}

export { SearchService };
