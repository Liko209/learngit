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
  PhoneContactEntity,
} from '../entity';
import { SearchUtils } from '../../../framework/utils/SearchUtils';
import {
  Terms,
  FormattedTerms,
} from '../../../framework/controller/interface/IEntityCacheSearchController';
import { ServiceConfig, ServiceLoader } from '../../serviceLoader';
import { MY_LAST_POST_VALID_PERIOD } from '../constants';
import { GroupConfigService } from 'sdk/module/groupConfig';
import { PhoneNumber } from 'sdk/module/phoneNumber/entity';
import { mainLogger } from 'foundation/src';

type MatchedInfo = {
  nameMatched: boolean;
  phoneNumberMatched: boolean;
  isMatched: boolean;
  matchedNumbers: PhoneNumber[];
};

class SearchPersonController {
  constructor(private _searchService: ISearchService) {}

  async doFuzzySearchPhoneContacts(
    options: FuzzySearchPersonOptions,
  ): Promise<{
    terms: string[];
    phoneContacts: PhoneContactEntity[];
  }> {
    const performanceTracer = PerformanceTracer.initial();

    const persons = await this._doFuzzySearchPersons(options);

    const phoneContacts: PhoneContactEntity[] = [];
    const results = { phoneContacts, terms: persons.terms.searchKeyTerms };

    persons.sortableModels.forEach((sortablePerson: SortableModel<Person>) => {
      sortablePerson.extraData &&
        sortablePerson.extraData.forEach((phoneNumber: PhoneNumber) => {
          if (
            persons.terms.searchKeyFormattedTerms.validFormattedKeys.length ===
              0 ||
            persons.terms.searchKeyFormattedTerms.validFormattedKeys.every(
              item => phoneNumber.id.includes(item.formatted),
            )
          ) {
            results.phoneContacts.push({
              phoneNumber,
              id: `${sortablePerson.entity.id}.${phoneNumber.id}`,
              person: sortablePerson.entity,
            });
          }
        });
    });
    mainLogger.debug(
      'search_person',
      ' person size =',
      persons.sortableModels.length,
      'phone size=',
      results.phoneContacts.length,
    );

    performanceTracer.end({ key: PERFORMANCE_KEYS.SEARCH_PHONE_NUMBER });
    return results;
  }

  async doFuzzySearchPersons(
    options: FuzzySearchPersonOptions,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Person>[];
  }> {
    const performanceTracer = PerformanceTracer.initial();
    const result = await this._doFuzzySearchPersons(options);
    performanceTracer.end({ key: PERFORMANCE_KEYS.SEARCH_PERSON });
    return {
      terms: result.terms.searchKeyTerms,
      sortableModels: result.sortableModels,
    };
  }

  private async _doFuzzySearchPersons(
    options: FuzzySearchPersonOptions,
  ): Promise<{
    terms: Terms;
    sortableModels: SortableModel<Person>[];
  }> {
    const {
      searchKey,
      excludeSelf,
      arrangeIds,
      fetchAllIfSearchKeyEmpty,
      asIdsOrder,
      recentFirst,
    } = options;

    const sortFunc =
      !asIdsOrder || recentFirst ? this._sortByKeyFunc : undefined;
    const toSortableModelFunc = await this._getTransFromPersonToSortableModelFunc(
      excludeSelf,
      fetchAllIfSearchKeyEmpty,
      recentFirst,
    );

    const genFormattedTermsFunc = (originalTerms: string[]) => {
      const formattedTerms: FormattedTerms = {
        formattedKeys: [],
        validFormattedKeys: [],
      };

      originalTerms.forEach(term => {
        const numberFormattedKey = SearchUtils.getValidPhoneNumber(term);
        const formattedKey = {
          original: term,
          formatted: numberFormattedKey,
        };

        formattedTerms.formattedKeys.push(formattedKey);
        if (numberFormattedKey.length) {
          formattedTerms.validFormattedKeys.push(formattedKey);
        }
      });
      return formattedTerms;
    };

    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
    const cacheSearchController = personService.getEntityCacheSearchController();
    const result = await cacheSearchController.searchEntities(
      toSortableModelFunc,
      genFormattedTermsFunc,
      searchKey,
      arrangeIds,
      sortFunc,
    );
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

  private _generateMatchedInfo(
    personId: number,
    name: string,
    phoneNumbers: PhoneNumber[],
    terms: Terms,
  ): MatchedInfo {
    const matchedNumbers: PhoneNumber[] = [];
    const matchedInfo = {
      matchedNumbers,
      nameMatched: false,
      phoneNumberMatched: false,
      isMatched: false,
    };

    matchedInfo.isMatched = terms.searchKeyFormattedTerms.formattedKeys.every(
      (term: { original: string; formatted: string }) => {
        const isNameMatched = name.includes(term.original);
        let isPhoneNumberMatched: boolean = false;
        if (
          !isNameMatched &&
          terms.searchKeyFormattedTerms.validFormattedKeys.length &&
          term.formatted.length &&
          phoneNumbers &&
          phoneNumbers.length
        ) {
          phoneNumbers.forEach((phoneNumber: PhoneNumber) => {
            if (phoneNumber.id.includes(term.formatted)) {
              if (!matchedInfo.matchedNumbers.includes(phoneNumber)) {
                matchedInfo.matchedNumbers.push(phoneNumber);
              }
              isPhoneNumberMatched = true;
            }
          });

          if (isPhoneNumberMatched) {
            matchedInfo.phoneNumberMatched = true;
          }
        } else {
          matchedInfo.nameMatched = isNameMatched;
        }
        return isNameMatched || isPhoneNumberMatched;
      },
    );

    if (!matchedInfo.isMatched && terms.searchKeyTermsToSoundex.length) {
      const personService = ServiceLoader.getInstance<PersonService>(
        ServiceConfig.PERSON_SERVICE,
      );

      matchedInfo.isMatched = matchedInfo.nameMatched = SearchUtils.isSoundexMatched(
        personService.getSoundexById(personId),
        terms.searchKeyTermsToSoundex,
      );
    }

    if (
      matchedInfo.isMatched &&
      !matchedInfo.phoneNumberMatched &&
      matchedInfo.nameMatched &&
      phoneNumbers &&
      phoneNumbers.length
    ) {
      phoneNumbers.forEach((phoneNumber: PhoneNumber) => {
        matchedInfo.matchedNumbers.push(phoneNumber);
      });
    }

    return matchedInfo;
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
      ? await this._searchService.getRecentSearchRecordsByType(
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
        if (!fetchAllIfSearchKeyEmpty && terms.searchKeyTerms.length === 0) {
          break;
        }

        if (
          !personService.isVisiblePerson(person) ||
          (excludeSelf && person.id === currentUserId)
        ) {
          break;
        }

        let personName: string = personService.getName(person);
        let personNameLowerCase: string = personName.toLowerCase();
        let sortValue: number = 0;
        let matchedNumbers: PhoneNumber[] = [];

        if (terms.searchKeyTerms.length) {
          const phoneNumbers: PhoneNumber[] = [];
          personService.getPhoneNumbers(person, (phoneNumber: PhoneNumber) => {
            phoneNumbers.push(phoneNumber);
          });
          const matchedInfo = this._generateMatchedInfo(
            person.id,
            personNameLowerCase,
            phoneNumbers,
            terms,
          );
          matchedNumbers = matchedInfo.matchedNumbers;
          if (matchedInfo.isMatched) {
            if (matchedInfo.nameMatched) {
              sortValue = PersonSortingOrder.FullNameMatching;
              if (
                person.first_name &&
                SearchUtils.isStartWithMatched(
                  person.first_name.toLowerCase(),
                  [terms.searchKeyTerms[0]],
                )
              ) {
                sortValue += PersonSortingOrder.FirstNameMatching;
              }
              if (
                person.last_name &&
                SearchUtils.isStartWithMatched(
                  person.last_name.toLowerCase(),
                  terms.searchKeyTerms,
                )
              ) {
                sortValue += PersonSortingOrder.LastNameMatching;
              }
            }
          } else if (
            person.email &&
            SearchUtils.isFuzzyMatched(
              person.email.toLowerCase(),
              terms.searchKeyTerms,
            )
          ) {
            sortValue = PersonSortingOrder.EmailMatching;
            matchedNumbers = phoneNumbers;
          } else {
            break;
          }
        }

        if (personName.length === 0) {
          personName = personService.getEmailAsName(person);
          personNameLowerCase = personName.toLowerCase();
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
          displayName: personName,
          secondSortKey: sortValue,
          thirdSortKey: personNameLowerCase,
          entity: person,
          extraData: matchedNumbers,
        };
      } while (false);
      return null;
    };
  }
}

export { SearchPersonController };
