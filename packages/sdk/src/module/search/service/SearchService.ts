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
  FuzzySearchContactOptions,
  PhoneContactEntity,
  FuzzySearchPhoneContactOptions,
} from '../entity';
import { SearchServiceController } from '../controller/SearchServiceController';
import { Person } from '../../person/entity';
import { SortableModel, IdModel } from '../../../framework/model';
import { SearchUserConfig } from '../config/SearchUserConfig';
import { IConfigHistory } from 'sdk/framework/config/IConfigHistory';
import { ConfigChangeHistory } from 'sdk/framework/config/types';
import { Nullable, UndefinedAble } from 'sdk/types';
import { configMigrator } from 'sdk/framework/config';
import { SearchConfigHistory } from '../config/ConfigHistory';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import GroupService, { Group, FuzzySearchGroupOptions } from 'sdk/module/group';
import { SortUtils } from 'sdk/framework/utils';
import { PerformanceTracer } from 'foundation/performance';
import { SEARCH_PERFORMANCE_KEYS } from '../config/performanceKeys';
import { PhoneNumber } from 'sdk/module/phoneNumber/entity';
import { Terms } from 'sdk/framework/search';

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
    return SearchConfigHistory;
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
    searchKey: UndefinedAble<string>,
    options: FuzzySearchContactOptions,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Person>[];
  }> {
    return await this.searchPersonController.doFuzzySearchPersons(
      searchKey,
      options,
    );
  }

  async doFuzzySearchPersonsAndGroups(
    searchKey: UndefinedAble<string>,
    contactOptions: FuzzySearchContactOptions,
    groupOptions: FuzzySearchGroupOptions,
    sortFunc?: (
      lsh: SortableModel<IdModel>,
      rsh: SortableModel<IdModel>,
    ) => number,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<IdModel>[];
  }> {
    return await this.searchPersonController.doFuzzySearchPersonsAndGroups(
      searchKey,
      contactOptions,
      groupOptions,
      sortFunc,
    );
  }

  async doFuzzySearchPhoneContacts(
    searchKey: UndefinedAble<string>,
    options: FuzzySearchPhoneContactOptions,
  ): Promise<{
    terms: string[];
    phoneContacts: PhoneContactEntity[];
  }> {
    return await this.searchPersonController.doFuzzySearchPhoneContacts(
      searchKey,
      options,
    );
  }

  async doFuzzySearchAllGroups(
    searchKey: UndefinedAble<string>,
    option: FuzzySearchGroupOptions,
  ) {
    const performanceTracer = PerformanceTracer.start();

    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );

    if (!option.sortFunc) {
      option.sortFunc = (
        groupA: SortableModel<Group>,
        groupB: SortableModel<Group>,
      ) => {
        return SortUtils.compareSortableModel<Group>(groupA, groupB);
      };
    }
    const result = await groupService.doFuzzySearchAllGroups(searchKey, option);

    performanceTracer.end({
      key: SEARCH_PERFORMANCE_KEYS.SEARCH_ALL_GROUPS,
      count: result && result.sortableModels ? result.sortableModels.length : 0,
    });
    return result;
  }

  generateMatchedInfo(
    personId: number,
    name: string,
    phoneNumbers: PhoneNumber[],
    terms: Terms,
  ) {
    return this.searchPersonController.generateMatchedInfo(
      personId,
      name,
      phoneNumbers,
      terms,
    );
  }

  generateFormattedTerms = (originalTerms: string[]) => {
    return this.searchPersonController.generateFormattedTerms(originalTerms);
  };
}

export { SearchService };
