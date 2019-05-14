/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-15 14:30:33
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { Person, PhoneNumberModel } from '../entity';
import { EntityCacheController } from 'sdk/framework/controller/impl/EntityCacheController';
import { IPersonService } from '../service/IPersonService';
import { SearchUtils } from 'sdk/framework/utils/SearchUtils';
import { PhoneNumberType } from 'sdk/module/phoneNumber/types';
import { AccountUserConfig } from 'sdk/module/account/config';

const soundex = require('soundex-code');

class PersonEntityCacheController extends EntityCacheController<Person> {
  private _soundexValue: Map<number, string[]> = new Map();
  private _phoneNumberCache: Map<string, Person> = new Map();
  private _companyId: number = 0;

  static buildPersonEntityCacheController(personService: IPersonService) {
    return new PersonEntityCacheController(personService);
  }

  constructor(private _personService: IPersonService) {
    super();
  }

  async clear(): Promise<void> {
    super.clear();
    this._soundexValue.clear();
    this._phoneNumberCache.clear();
    this._companyId = 0;
  }

  public getSoundexById(id: number): string[] {
    return this._soundexValue.get(id) || [];
  }

  public getPersonByPhoneNumber(phoneNumber: string) {
    return this._phoneNumberCache.get(phoneNumber);
  }

  private _removePhoneNumbersByPerson(person: Person) {
    if (!person) {
      return;
    }
    if (person.sanitized_rc_extension) {
      const ext = person.sanitized_rc_extension.extensionNumber;
      this._phoneNumberCache.has(ext) &&
        person.company_id === this._companyId &&
        this._phoneNumberCache.delete(ext);
    }
    person.rc_phone_numbers &&
      person.rc_phone_numbers.forEach((phoneNumberModel: PhoneNumberModel) => {
        const phoneNumber = phoneNumberModel.phoneNumber;
        this._phoneNumberCache.has(phoneNumber) &&
          this._phoneNumberCache.delete(phoneNumber);
      });
  }

  private _removePhoneNumbersByPersonId(id: number) {
    const person = this.getSynchronously(id);
    if (person) {
      this._removePhoneNumbersByPerson(person);
    }
  }

  protected deleteInternal(key: number) {
    this._removePhoneNumbersByPersonId(key);
    if (this._soundexValue.has(key)) {
      this._soundexValue.delete(key);
    }
    super.deleteInternal(key);
  }

  private _addPhoneNumbers(person: Person) {
    if (!person) {
      return;
    }
    if (person.sanitized_rc_extension) {
      if (!this._companyId) {
        const userConfig = new AccountUserConfig();
        this._companyId = userConfig.getCurrentCompanyId();
      }
      const ext = person.sanitized_rc_extension.extensionNumber;
      ext &&
        person.company_id === this._companyId &&
        this._phoneNumberCache.set(ext, person);
    }
    person.rc_phone_numbers &&
      person.rc_phone_numbers.forEach((phoneNumberModel: PhoneNumberModel) => {
        if (phoneNumberModel.usageType === PhoneNumberType.DirectNumber) {
          const phoneNumber = phoneNumberModel.phoneNumber;
          phoneNumber && this._phoneNumberCache.set(phoneNumber, person);
        }
      });
  }

  protected putInternal(person: Person) {
    super.putInternal(person);
    this._setSoundexValue(person);
    this._addPhoneNumbers(person);
  }

  protected updatePartial(oldEntity: Person, partialEntity: Partial<Person>) {
    this._removePhoneNumbersByPerson(oldEntity);
    super.updatePartial(oldEntity, partialEntity);
    this._setSoundexValue(oldEntity);
    this._addPhoneNumbers(oldEntity);
  }

  private _setSoundexValue(person: Person) {
    let soundexResult: string[] = [];
    if (this._personService.isValidPerson(person)) {
      const name = this._personService.getName(person);
      if (name) {
        soundexResult = SearchUtils.getTermsFromText(name).map(item =>
          soundex(item),
        );
      } else {
        soundexResult = [soundex(person.email)];
      }
    }
    this._soundexValue.set(person.id, soundexResult);
  }
}

export { PersonEntityCacheController };
