/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-21 21:24:34
 * Copyright © RingCentral. All rights reserved.
 */

import { Person } from '../../models';

class PersonDataHandler {
  private static _instance: PersonDataHandler | undefined = undefined;

  static getInstance() {
    if (this._instance == null) {
      this._instance = new PersonDataHandler();
    }

    return this._instance;
  }

  getPersonDisplayName(person: Person) {
    let dName = '';
    if (person) {
      if (person.first_name) {
        dName += person.first_name;
      }

      if (person.last_name) {
        if (dName.length > 0) {
          dName += ' ';
        }
        dName += person.last_name;
      }

      if (dName.length === 0) {
        dName = person.email;
      }
    }
    return dName;
  }
}

export { PersonDataHandler };
