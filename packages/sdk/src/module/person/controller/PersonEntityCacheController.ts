/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-15 14:30:33
 * Copyright © RingCentral. All rights reserved.
 */

import { Person } from '../entity';
import { EntityCacheController } from 'sdk/framework/controller/impl/EntityCacheController';
import { IPersonService } from '../service/IPersonService';
import { SearchUtils } from 'sdk/framework/utils/SearchUtils';
import { PhoneNumber, PhoneNumberType } from 'sdk/module/phoneNumber/entity';

const soundex = require('soundex-code');

class PersonEntityCacheController extends EntityCacheController<Person> {
  private _soundexValue: Map<number, string[]> = new Map();
  private _shortNumberCache: Map<string, Person> = new Map();
  private _longNumberCache: Map<string, Person> = new Map();

  static buildPersonEntityCacheController(personService: IPersonService) {
    return new PersonEntityCacheController(personService);
  }

  constructor(private _personService: IPersonService) {
    super();
  }

  async clear(): Promise<void> {
    super.clear();
    this._soundexValue.clear();
    this._shortNumberCache.clear();
    this._longNumberCache.clear();
  }

  public getSoundexById(id: number): string[] {
    return this._soundexValue.get(id) || [];
  }

  public getPersonByPhoneNumber(phoneNumber: string, isShortNumber: boolean) {
    return isShortNumber
      ? this._shortNumberCache.get(phoneNumber)
      : this._longNumberCache.get(phoneNumber);
  }

  private _removePhoneNumbersByPerson(person: Person) {
    if (!person) {
      return;
    }

    this._personService.getPhoneNumbers(person, (phoneNumber: PhoneNumber) => {
      phoneNumber.phoneNumberType === PhoneNumberType.Extension
        ? this._shortNumberCache.delete(phoneNumber.id)
        : this._longNumberCache.delete(phoneNumber.id);
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

    this._personService.getPhoneNumbers(person, (phoneNumber: PhoneNumber) => {
      phoneNumber.phoneNumberType === PhoneNumberType.Extension
        ? this._shortNumberCache.set(phoneNumber.id, person)
        : this._longNumberCache.set(phoneNumber.id, person);
    });
  }

  protected putInternal(person: Person) {
    super.putInternal(person);

    if (this._personService.isValidPerson(person)) {
      this._setSoundexValue(person);
      this._addPhoneNumbers(person);
    }
  }

  protected updatePartial(oldEntity: Person, partialEntity: Partial<Person>) {
    this._removePhoneNumbersByPerson(oldEntity);
    super.updatePartial(oldEntity, partialEntity);
    this._setSoundexValue(oldEntity);
    this._addPhoneNumbers(oldEntity);
  }

  private _setSoundexValue(person: Person) {
    let soundexResult: string[] = [];
    if (this._personService.isVisiblePerson(person)) {
      const name = this._personService.getName(person);
      if (name) {
        soundexResult = SearchUtils.getTermsFromText(name).map(item => soundex(item));
      } else {
        soundexResult = [soundex(person.email)];
      }
    }
    this._soundexValue.set(person.id, soundexResult);
  }
}

export { PersonEntityCacheController };
