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
import { Group } from 'sdk/module/group';
import { SortableModel } from '../../../framework/model';
import {
  PerformanceTracer,
  PERFORMANCE_KEYS,
} from '../../../utils/performance';
import { AccountService } from '../../account/service';
import {
  RecentSearchTypes,
  FuzzySearchPersonOptions,
  PersonSortingOrder,
  RecentSearchModel,
} from '../entity';
import { SearchUtils } from '../../../framework/utils/SearchUtils';
import { Terms } from '../../../framework/controller/interface/IEntityCacheSearchController';
import { ServiceConfig, ServiceLoader } from '../../serviceLoader';
import { MY_LAST_POST_VALID_PERIOD } from '../constants';
import { GroupConfigService } from 'sdk/module/groupConfig';

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

    const performanceTracer = PerformanceTracer.initial();

    const sortFunc =
      !asIdsOrder || recentFirst ? this._sortByKeyFunc : undefined;
    const toSortableModelFunc = await this._getTransFromPersonToSortableModelFunc(
      excludeSelf,
      fetchAllIfSearchKeyEmpty,
      recentFirst,
    );
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
    const cacheSearchController = personService.getEntityCacheSearchController();
    const result = await cacheSearchController.searchEntities(
      toSortableModelFunc,
      searchKey,
      arrangeIds,
      sortFunc,
    );

    performanceTracer.end({ key: PERFORMANCE_KEYS.SEARCH_PERSON });
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

  private _getMostRecentViewTime(
    personId: number,
    groupConfigService: GroupConfigService,
    recentSearchedPersons: Map<string | number, RecentSearchModel>,
    individualGroups: Map<number, Group>,
  ) {
    const individualGroup = individualGroups.get(personId);
    const now = Date.now();
    const record = recentSearchedPersons.get(personId);
    const config =
      individualGroup &&
      groupConfigService.getSynchronously(individualGroup.id);

    const lastSearchTime = (record && record.time_stamp) || 0;
    let lastPostTime = (config && config.my_last_post_time) || 0;
    lastPostTime =
      now - lastPostTime > MY_LAST_POST_VALID_PERIOD ? 0 : lastPostTime;
    return Math.max(lastPostTime, lastSearchTime);
  }

  private async _getTransFromPersonToSortableModelFunc(
    excludeSelf?: boolean,
    fetchAllIfSearchKeyEmpty?: boolean,
    recentFirst?: boolean,
  ) {
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const currentUserId = userConfig.getGlipUserId();
    const recentSearchedPersons = recentFirst
      ? this._searchService.getRecentSearchRecordsByType(
          RecentSearchTypes.PEOPLE,
        )
      : undefined;

    const individualGroups = recentFirst
      ? ServiceLoader.getInstance<GroupService>(
          ServiceConfig.GROUP_SERVICE,
        ).getIndividualGroups()
      : undefined;

    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
    const groupConfigService = ServiceLoader.getInstance<GroupConfigService>(
      ServiceConfig.GROUP_CONFIG_SERVICE,
    );
    return (person: Person, terms: Terms) => {
      do {
        const { searchKeyTerms, searchKeyTermsToSoundex } = terms;
        if (!fetchAllIfSearchKeyEmpty && searchKeyTerms.length === 0) {
          break;
        }

        if (
          !personService.isVisiblePerson(person) ||
          (excludeSelf && person.id === currentUserId)
        ) {
          break;
        }

        let name: string = personService.getName(person);
        let sortValue: number = 0;
        if (searchKeyTerms.length > 0) {
          const isNameMatched =
            SearchUtils.isFuzzyMatched(name.toLowerCase(), searchKeyTerms) ||
            (searchKeyTermsToSoundex.length &&
              SearchUtils.isSoundexMatched(
                personService.getSoundexById(person.id),
                searchKeyTermsToSoundex,
              ));

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
          } else if (
            person.email &&
            SearchUtils.isFuzzyMatched(
              person.email.toLowerCase(),
              searchKeyTerms,
            )
          ) {
            sortValue = PersonSortingOrder.EmailMatching;
          } else {
            break;
          }
        }

        if (name.length <= 0) {
          name = personService.getEmailAsName(person);
        }
        const firstSortKey = recentFirst
          ? this._getMostRecentViewTime(
              person.id,
              groupConfigService,
              recentSearchedPersons!,
              individualGroups!,
            )
          : 0;
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
