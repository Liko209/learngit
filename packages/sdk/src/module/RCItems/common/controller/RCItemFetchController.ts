/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-06-27 15:05:49
 * Copyright © RingCentral. All rights reserved.
 */

import { RCItemSyncController } from '../../sync';
import { IdModel, ModelIdType } from 'sdk/framework/model';
import { IRCItemSyncConfig } from '../../config/IRCItemSyncConfig';
import {
  FilterOptions,
  FetchDataOptions,
  FetchResult,
  Caller,
} from '../../types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SearchService } from 'sdk/module/search';
import { SearchUtils } from 'sdk/framework/utils/SearchUtils';
import { DEFAULT_FETCH_SIZE, SYNC_DIRECTION } from '../../constants';
import { QUERY_DIRECTION } from 'sdk/dao';
import { JError } from 'foundation/error';
import { mainLogger } from 'foundation/log';
import { PerformanceTracer } from 'foundation/performance';
import { PhoneContactEntity } from 'sdk/module/search/entity';

abstract class RCItemFetchController<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
> extends RCItemSyncController<T, IdType> {
  constructor(
    syncName: string,
    syncConfig: IRCItemSyncConfig,
    entityKey: string,
    interval?: number,
    requestSyncInterval?: number,
  ) {
    super(syncName, syncConfig, entityKey, interval, requestSyncInterval);
  }

  async buildFilterFunc(
    option: FilterOptions<T>,
  ): Promise<(data: T) => boolean> {
    const { filterKey } = option;
    if (!filterKey) {
      return () => true;
    }
    const phoneContacts = await ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    ).doFuzzySearchPhoneContacts(filterKey, {});
    const numberSet = new Set(
      phoneContacts.phoneContacts.map(
        (data: PhoneContactEntity) => data.phoneNumber.id,
      ),
    );
    const terms: string[] = SearchUtils.getTermsFromText(
      filterKey.toLowerCase().trim(),
    );
    const formattedTerms = terms.map((term: string) => {
      const validNumber = SearchUtils.getValidPhoneNumber(term);
      return { validNumber, origin: term };
    });

    return (data: T): boolean => {
      const { name, extensionNumber, phoneNumber } = this.getFilterInfo(data);
      const lowerCaseName = name && name.toLowerCase();
      let result =
        (extensionNumber && numberSet.has(extensionNumber)) ||
        (phoneNumber && numberSet.has(phoneNumber));
      if (!result) {
        result = formattedTerms.every(term => {
          // match name
          if (lowerCaseName && lowerCaseName.includes(term.origin)) {
            return true;
          }
          // match phoneNumber
          if (term.validNumber) {
            return Boolean(
              (extensionNumber && extensionNumber.includes(term.validNumber)) ||
                (phoneNumber && phoneNumber.includes(term.validNumber)),
            );
          }
          return false;
        });
      }
      return !!result;
    };
  }

  async fetchData(
    options: FetchDataOptions<T, IdType>,
  ): Promise<FetchResult<T>> {
    const {
      limit = DEFAULT_FETCH_SIZE,
      direction = QUERY_DIRECTION.OLDER,
      anchorId,
      filterFunc,
    } = options;

    const performanceTracer = PerformanceTracer.start();
    let hasMore = true;
    mainLogger
      .tags(this.syncName)
      .info(
        `fetchData, anchorId:${anchorId}, limit:${limit}, direction:${direction}, anchorId:${anchorId}`,
      );

    let results: T[] = await this.fetchDataFromDB(options);
    this.onDBFetchFinished(results, performanceTracer);

    // only request from server when has no data in local and filter is undefined
    let serverResults: T[] = [];
    if (results.length < limit) {
      if (filterFunc) {
        hasMore = false;
      } else {
        hasMore = await this.syncConfig.getHasMore();
        mainLogger
          .tags(this.syncName)
          .info('fetch size not enough, need fetch from server: ', { hasMore });
        if (hasMore) {
          serverResults = await this.doSync(
            false,
            direction === QUERY_DIRECTION.OLDER
              ? SYNC_DIRECTION.OLDER
              : SYNC_DIRECTION.NEWER,
            false,
          ).catch((reason: JError) => {
            // The error page for callLog/voicemail is displayed only when the first fetch data failed
            if (!anchorId && !results.length) {
              throw reason;
            }
            return [];
          });

          results = results.concat(serverResults);
          hasMore = await this.syncConfig.getHasMore();
        }
      }
    }

    mainLogger
      .tags(this.syncName)
      .info(
        `fetchVoicemails success, dataSize:${
          results.length
        }, hasMore:${hasMore}`,
      );
    this.onFetchFinished(serverResults, performanceTracer);
    return {
      hasMore,
      data: results,
    };
  }

  protected abstract getFilterInfo(data: T): Caller;
  protected abstract async fetchDataFromDB(
    options: FetchDataOptions<T, IdType>,
  ): Promise<T[]>;
  protected abstract onDBFetchFinished(
    results: T[],
    performanceTracer?: PerformanceTracer,
  ): void;
  protected abstract onFetchFinished(
    results: T[],
    performanceTracer?: PerformanceTracer,
  ): void;
}

export { RCItemFetchController };
