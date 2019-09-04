/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-08-22 14:54:44
 * Copyright © RingCentral. All rights reserved.
 */

import { ISortableModelWithData } from '@/store/base';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { PersonService } from 'sdk/module/person';
import { Person } from 'sdk/module/person/entity';
import { IdModelFocHandler } from './IdModelFocHandler';
import { IdModelFocBuilder } from './IdModelFocBuilder';
import { DisplayNameModel } from 'sdk/framework/model';
import { UndefinedAble } from 'sdk/types';
import { SearchService } from 'sdk/module/search/service';
import { SearchUtils } from 'sdk/framework/utils/SearchUtils';
import { Terms } from 'sdk/framework/search';
import { SortUtils } from 'sdk/framework/utils';
import { PhoneNumber } from 'sdk/module/phoneNumber/entity';

enum CONTACT_TAB_TYPE {
  ALL,
  PERSONAL,
  GLIP_CONTACT,
  CLOUD_CONTACT,
  FAVORITES,
}

class ContactFocHandler extends IdModelFocHandler {
  private _personService: PersonService;
  private _searchService: SearchService;
  private _type: CONTACT_TAB_TYPE;
  private _searchTerms: Terms;

  constructor(
    type: CONTACT_TAB_TYPE = CONTACT_TAB_TYPE.ALL,
    searchKey: UndefinedAble<string> = undefined,
  ) {
    super();
    this._personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
    this._searchService = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );
    this._type = type;

    this._searchTerms = SearchUtils.toDefaultSearchKeyTerms(searchKey);
  }

  transformFunc = (
    model: Person,
  ): ISortableModelWithData<DisplayNameModel> => ({
    id: model.id,
    sortValue: model.id,
    data: {
      id: model.id,
      displayName: this._personService.getFullName(model).toLowerCase(),
    },
  });

  firstCharAsNumber(str: string) {
    return str[0] >= 'a' && str[0] <= 'z' ? 1 : 0;
  }

  sortFunc = (
    lhs: ISortableModelWithData<DisplayNameModel>,
    rhs: ISortableModelWithData<DisplayNameModel>,
  ): number => {
    const left = lhs.data!.displayName;
    const right = rhs.data!.displayName;
    const result = this.firstCharAsNumber(right) - this.firstCharAsNumber(left);
    return result ? result : SortUtils.compareLowerCaseString(left, right);
  };

  filterFunc = (person: Person) => {
    let isValid = this._personService.isVisiblePerson(person);

    if (isValid) {
      switch (this._type) {
        case CONTACT_TAB_TYPE.ALL:
          break;
        case CONTACT_TAB_TYPE.GLIP_CONTACT:
          break;
        case CONTACT_TAB_TYPE.PERSONAL:
          break;
        case CONTACT_TAB_TYPE.CLOUD_CONTACT:
          break;
        default:
          break;
      }

      if (this._searchTerms.searchKey) {
        const phoneNumbers: PhoneNumber[] = [];
        this._personService.getPhoneNumbers(
          person,
          (phoneNumber: PhoneNumber) => {
            phoneNumbers.push(phoneNumber);
          },
        );

        const matchInfo = this._searchService.generateMatchedInfo(
          person.id,
          this._personService.getFullName(person).toLowerCase(),
          phoneNumbers,
          this._searchTerms,
        );

        isValid =
          matchInfo.isMatched ||
          (person.email
            ? SearchUtils.isFuzzyMatched(
                person.email.toLowerCase(),
                this._searchTerms.searchKeyTerms,
              )
            : false);
      }
    }

    return isValid;
  };

  protected async createFoc() {
    await SearchUtils.formatTerms(
      this._searchTerms,
      this._searchService.generateFormattedTerms,
    );
    return IdModelFocBuilder.buildFoc(
      this._personService.getEntitySource(),
      this.transformFunc,
      this.filterFunc,
      this.sortFunc,
    );
  }
}

export { ContactFocHandler, CONTACT_TAB_TYPE };
