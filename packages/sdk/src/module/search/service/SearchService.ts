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
  PhoneContactEntity,
} from '../entity';
import { SearchServiceController } from '../controller/SearchServiceController';
import { Person } from '../../person/entity';
import { SortableModel } from '../../../framework/model';
import { SearchUserConfig } from '../config/SearchUserConfig';
import { IConfigHistory } from 'sdk/framework/config/IConfigHistory';
import { ConfigChangeHistory } from 'sdk/framework/config/types';
import { Nullable } from 'sdk/types';
import { configMigrator } from 'sdk/framework/config';
import { searchConfigHistory } from '../config/ConfigHistory';

class SearchService extends AbstractService
  implements ISearchService, IConfigHistory {
  private _searchServiceController: SearchServiceController = new SearchServiceController(
    this,
  );
  private _userConfig: SearchUserConfig;

  constructor() {
    super();

    configMigrator.addHistory(this);
  }

  protected onStarted() {}

  protected onStopped() {}

  getHistoryDetail(): Nullable<ConfigChangeHistory> {
    return searchConfigHistory;
  }

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

  async addRecentSearchRecord(
    type: RecentSearchTypes,
    value: string | number,
    params = {},
  ) {
    await this.recentSearchRecordController.addRecentSearchRecord(
      type,
      value,
      params,
    );
  }

  async clearRecentSearchRecords() {
    await this.recentSearchRecordController.clearRecentSearchRecords();
  }

  async getRecentSearchRecords(): Promise<RecentSearchModel[]> {
    return await this.recentSearchRecordController.getRecentSearchRecords();
  }

  async getRecentSearchRecordsByType(type: RecentSearchTypes) {
    return await this.recentSearchRecordController.getRecentSearchRecordsByType(
      type,
    );
  }

  async removeRecentSearchRecords(ids: Set<number>) {
    return await this.recentSearchRecordController.removeRecentSearchRecords(
      ids,
    );
  }

  async doFuzzySearchPersons(
    options: FuzzySearchPersonOptions,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Person>[];
  }> {
    return await this.searchPersonController.doFuzzySearchPersons(options);
  }

  async doFuzzySearchPhoneContacts(
    options: FuzzySearchPersonOptions,
  ): Promise<{
    terms: string[];
    phoneContacts: PhoneContactEntity[];
  }> {
    return await this.searchPersonController.doFuzzySearchPhoneContacts(
      options,
    );
  }
}

export { SearchService };
