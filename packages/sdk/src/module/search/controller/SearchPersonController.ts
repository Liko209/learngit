/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-14 16:13:52
 * Copyright © RingCentral. All rights reserved.
 */
/* eslint-disable */
import _ from 'lodash';
import { ISearchService } from '../service/ISearchService';
import { GroupService } from '../../group';
import { PersonService } from '../../person';
import { Person } from '../../person/entity';
import { Group } from 'sdk/module/group';
import { SortableModel, IdModel } from 'sdk/framework/model';
import { PerformanceTracer } from 'foundation';
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
import { LAST_ACCESS_VALID_PERIOD } from '../constants';
import { GroupConfigService } from 'sdk/module/groupConfig';
import { PhoneNumber, PhoneNumberType } from 'sdk/module/phoneNumber/entity';
import { mainLogger } from 'foundation';
import { SEARCH_PERFORMANCE_KEYS } from '../config';
import { SortUtils } from 'sdk/framework/utils';

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
    const performanceTracer = PerformanceTracer.start();

    const persons = await this._doFuzzySearchPersons({
      ...options,
      ignoreEmail: true,
    });

    const phoneContacts: PhoneContactEntity[] = [];
    const results = { phoneContacts, terms: persons.terms.searchKeyTerms };

    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const myCompanyId = userConfig.getCurrentCompanyId();
    persons.sortableModels.forEach((sortablePerson: SortableModel<Person>) => {
      const orderedPhoneNumbers = sortablePerson.extraData as PhoneNumber[]; // order as ext first
      if (orderedPhoneNumbers && orderedPhoneNumbers.length) {
        //for co-workers, we should only show matched extension
        const nameMatchedOnly =
          persons.terms.searchKeyFormattedTerms.validFormattedKeys.length === 0;

        let showExtensionOnly =
          nameMatchedOnly &&
          sortablePerson.entity.company_id === myCompanyId &&
          orderedPhoneNumbers[0].phoneNumberType === PhoneNumberType.Extension;

        for (const phoneNumber of orderedPhoneNumbers) {
          if (
            (nameMatchedOnly &&
              persons.terms.searchKeyFormattedTerms.validFormattedKeys
                .length === 0) ||
            persons.terms.searchKeyFormattedTerms.validFormattedKeys.every(
              item => phoneNumber.id.includes(item.formatted),
            )
          ) {
            if (showExtensionOnly) {
              if (phoneNumber.phoneNumberType === PhoneNumberType.Extension) {
                results.phoneContacts.push(
                  this._buildPhoneContact(phoneNumber, sortablePerson.entity),
                );
              } else {
                break;
              }
            } else {
              results.phoneContacts.push(
                this._buildPhoneContact(phoneNumber, sortablePerson.entity),
              );
            }
          }
        }
      }
    });
    mainLogger.debug(
      'search_person',
      ' person size =',
      persons.sortableModels.length,
      'phone size=',
      results.phoneContacts.length,
    );

    performanceTracer.end({ key: SEARCH_PERFORMANCE_KEYS.SEARCH_PHONE_NUMBER });
    return results;
  }

  private _buildPhoneContact(phoneNumber: PhoneNumber, person: Person) {
    return {
      phoneNumber,
      person,
      id: `${person.id}.${phoneNumber.id}`,
    };
  }

  async doFuzzySearchPersons(
    options: FuzzySearchPersonOptions,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Person>[];
  }> {
    const performanceTracer = PerformanceTracer.start();
    const result = await this._doFuzzySearchPersons(options);
    performanceTracer.end({ key: SEARCH_PERFORMANCE_KEYS.SEARCH_PERSON });
    return {
      terms: result.terms.searchKeyTerms,
      sortableModels: result.sortableModels,
    };
  }

  async doFuzzySearchPersonsAndGroups(
    options: FuzzySearchPersonOptions,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<IdModel>[];
  }> {
    const result: {
      terms: string[];
      sortableModels: SortableModel<IdModel>[];
    } = {
      terms: [],
      sortableModels: [],
    };
    const persons = await this.doFuzzySearchPersons(options);
    result.terms = persons.terms;
    result.sortableModels = persons.sortableModels;
    if (options.searchKey) {
      const groupService = ServiceLoader.getInstance<GroupService>(
        ServiceConfig.GROUP_SERVICE,
      );
      const groups = await groupService.doFuzzySearchALlGroups(
        options.searchKey,
        true,
        true,
        true,
      );
      result.sortableModels = [
        ...result.sortableModels,
        ...groups.sortableModels,
      ];
    }
    return result;
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
      ignoreEmail,
    } = options;

    const sortFunc =
      !asIdsOrder || recentFirst ? this._sortByKeyFunc : undefined;
    const toSortableModelFunc = await this._getTransFromPersonToSortableModelFunc(
      excludeSelf,
      fetchAllIfSearchKeyEmpty,
      recentFirst,
      ignoreEmail,
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

  private _sortByKeyFunc = (
    personA: SortableModel<Person>,
    personB: SortableModel<Person>,
  ) => {
    return SortUtils.compareSortableModel<Person>(personA, personB);
  };

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
    const lastPostTime = (config && config.my_last_post_time) || 0;

    const maxAccessTime = Math.max(lastPostTime, lastSearchTime);
    return now - maxAccessTime > LAST_ACCESS_VALID_PERIOD ? 0 : maxAccessTime;
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

  // Rule:
  // The search results should be ranked as follows: perfect match>start with> fuzzy search/Soundex search/email matched
  // If there are multiple results fall in each of the categories, they should be ordered by most recent (searched and tapped/sent message to in the last 30 days)>alphabetical
  private async _getTransFromPersonToSortableModelFunc(
    excludeSelf?: boolean,
    fetchAllIfSearchKeyEmpty?: boolean,
    recentFirst?: boolean,
    ignoreEmail?: boolean,
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
            !ignoreEmail &&
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
        const recentViewTime = recentFirst
          ? this._getMostRecentViewTime(
              person.id,
              groupConfigService,
              recentSearchedPersons!,
              individualGroups!,
            )
          : 0;
        return {
          id: person.id,
          displayName: personName,
          lowerCaseName: personNameLowerCase,
          sortWeights: [sortValue, recentViewTime],
          entity: person,
          extraData: matchedNumbers,
        };
      } while (false);
      return null;
    };
  }
}

export { SearchPersonController };
