/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-15 14:30:33
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { Person } from '../entity';
import { EntityCacheController } from '../../../framework/controller/impl/EntityCacheController';
import { IPersonService } from '../service/IPersonService';
const soundex = require('soundex-code');
class PersonEntityCacheController extends EntityCacheController<Person> {
  private _soundexValue: Map<number, string[]> = new Map();

  static buildPersonEntityCacheController(personService: IPersonService) {
    return new PersonEntityCacheController(personService);
  }

  constructor(private _personService: IPersonService) {
    super();
  }

  async clear(): Promise<void> {
    super.clear();
    this._soundexValue.clear();
  }

  public getSoundexById(id: number): string[] {
    return this._soundexValue.get(id) || [];
  }

  protected deleteInternal(key: number) {
    if (this._soundexValue.has(key)) {
      this._soundexValue.delete(key);
    }
    super.deleteInternal(key);
  }

  protected putInternal(person: Person) {
    if (!this._personService.isCacheValid(person)) {
      return;
    }
    super.putInternal(person);
    this._setSoundexValue(person);
  }

  protected updatePartial(oldEntity: Person, partialEntity: Partial<Person>) {
    super.updatePartial(oldEntity, partialEntity);
    this._setSoundexValue(oldEntity);
  }

  private _setSoundexValue(person: Person) {
    let soundexResult: string[] = [];
    if (this._personService.isValidPerson(person)) {
      const name = this._personService.getName(person);
      if (name) {
        soundexResult = name.split(' ').map(item => soundex(item));
      } else {
        soundexResult = [soundex(person.email)];
      }
    }
    this._soundexValue.set(person.id, soundexResult);
  }
}

export { PersonEntityCacheController };
