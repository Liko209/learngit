/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-14 16:13:52
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { ISearchService } from '../service/ISearchService';
import { GroupService } from '../../group';
import { PersonService } from '../../person';
import { Person } from '../../person/entity';
import { SortableModel } from '../../../framework/model';
import {
  PerformanceTracerHolder,
  PERFORMANCE_KEYS,
} from '../../../utils/performance';
import { AccountGlobalConfig } from '../../../service/account/config';
import {
  RecentSearchTypes,
  FuzzySearchPersonOptions,
  PersonSortingOrder,
} from '../entity';
import { SearchUtils } from '../../../framework/utils/SearchUtils';
import { Terms } from '../../../framework/controller/interface/IEntityCacheSearchController';
class SearchPersonController {
  constructor(private _searchService: ISearchService) {}

  async doFuzzySearchPersons(
    options: FuzzySearchPersonOptions,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Person>[];
  } | null> {
    const {
      searchKey,
      excludeSelf,
      arrangeIds,
      fetchAllIfSearchKeyEmpty,
      asIdsOrder,
      recentFirst,
    } = options;

    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.SEARCH_PERSON,
      logId,
    );

    const sortFunc =
      !asIdsOrder || recentFirst ? this._sortByKeyFunc : undefined;
    const toSortableModelFunc = await this._getTransFromPersonToSortableModelFunc(
      excludeSelf,
      fetchAllIfSearchKeyEmpty,
      recentFirst,
    );
    const personService = PersonService.getInstance() as PersonService;
    const cacheSearchController = personService.getEntityCacheSearchController();
    const result = await cacheSearchController.searchEntities(
      toSortableModelFunc,
      searchKey,
      arrangeIds,
      sortFunc,
    );

    PerformanceTracerHolder.getPerformanceTracer().end(logId);
    return result;
  }

  private get _sortByKeyFunc() {
    return (personA: SortableModel<Person>, personB: SortableModel<Person>) => {
      if (personA.firstSortKey > personB.firstSortKey) {
        return -1;
      }
      if (personA.firstSortKey < personB.firstSortKey) {
        return 1;
      }

      if (personA.secondSortKey > personB.secondSortKey) {
        return -1;
      }
      if (personA.secondSortKey < personB.secondSortKey) {
        return 1;
      }

      if (personA.thirdSortKey < personB.thirdSortKey) {
        return -1;
      }
      if (personA.thirdSortKey > personB.thirdSortKey) {
        return 1;
      }
      return 0;
    };
  }
  private async _getTransFromPersonToSortableModelFunc(
    excludeSelf?: boolean,
    fetchAllIfSearchKeyEmpty?: boolean,
    recentFirst?: boolean,
  ) {
    const currentUserId = AccountGlobalConfig.getCurrentUserId();
    const recentSearchedPersons = recentFirst
      ? this._searchService.getRecentSearchRecordsByType(
          RecentSearchTypes.PEOPLE,
        )
      : undefined;

    const individualGroups = recentFirst
      ? GroupService.getInstance<GroupService>().getIndividualGroups()
      : undefined;

    const personService = PersonService.getInstance() as PersonService;

    return (person: Person, terms: Terms) => {
      do {
        const { searchKeyTerms, searchKeyTermsToSoundex } = terms;
        if (!fetchAllIfSearchKeyEmpty && searchKeyTerms.length === 0) {
          break;
        }

        if (
          !personService.isValidPerson(person) ||
          (excludeSelf && person.id === currentUserId)
        ) {
          break;
        }

        let name: string = personService.getName(person);
        let sortValue: number = 0;
        if (searchKeyTerms.length > 0) {
          const lowerCaseName = name.toLowerCase();
          const lowerCaseEmail = person.email.toLowerCase();
          const isNameMatched =
            SearchUtils.isFuzzyMatched(lowerCaseName, searchKeyTerms) ||
            SearchUtils.isSoundexMatched(
              lowerCaseName,
              searchKeyTermsToSoundex,
            );
          const isEmailMatched =
            SearchUtils.isFuzzyMatched(lowerCaseEmail, searchKeyTerms) ||
            SearchUtils.isSoundexMatched(
              lowerCaseEmail,
              searchKeyTermsToSoundex,
            );

          if (isNameMatched) {
            sortValue = PersonSortingOrder.FullNameMatching;
            if (
              person.first_name &&
              SearchUtils.isStartWithMatched(person.first_name.toLowerCase(), [
                searchKeyTerms[0],
              ])
            ) {
              sortValue += PersonSortingOrder.FirstNameMatching;
            }
            if (
              person.last_name &&
              SearchUtils.isStartWithMatched(
                person.last_name.toLowerCase(),
                searchKeyTerms,
              )
            ) {
              sortValue += PersonSortingOrder.LastNameMatching;
            }
          } else if (person.email && isEmailMatched) {
            sortValue = PersonSortingOrder.EmailMatching;
          } else {
            break;
          }
        }

        if (name.length <= 0) {
          name = personService.getEmailAsName(person);
        }
        let firstSortKey = 0;
        if (recentFirst) {
          const individualGroup =
            individualGroups && individualGroups.get(person.id);
          const record =
            recentSearchedPersons && recentSearchedPersons.get(person.id);
          const lastSearchedTime = (record && record.time_stamp) || 0;
          const lastPostTime =
            (individualGroup && individualGroup.most_recent_post_created_at) ||
            0;
          firstSortKey = Math.max(lastPostTime, lastSearchedTime);
        }

        return {
          firstSortKey,
          id: person.id,
          displayName: name,
          secondSortKey: sortValue,
          thirdSortKey: name.toLowerCase(),
          entity: person,
        };
      } while (false);
      return null;
    };
  }
}

export { SearchPersonController };
