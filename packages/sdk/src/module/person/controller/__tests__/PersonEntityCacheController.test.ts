/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-17 14:17:10
 * Copyright © RingCentral. All rights reserved.
 */

import { PersonEntityCacheController } from '../PersonEntityCacheController';
import { AccountUserConfig } from '../../../../module/account/config';
import { Person } from '../../entity';
import { PersonService } from '../../service/PersonService';
const soundex = require('soundex-code');
jest.mock('../../../../module/account/config');
jest.mock('../../../../api');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('PersonEntityCacheController', () => {
  let personEntityCacheController: PersonEntityCacheController;
  function setUp() {
    const personService: any = new PersonService();
    personEntityCacheController = new PersonEntityCacheController(
      personService,
    );
    AccountUserConfig.prototype.getGlipUserId = jest.fn().mockReturnValue(1);
  }
  function prepareForPersonData() {
    personEntityCacheController.initialize([
      {
        id: 2,
        display_name: 'bruce wang',
      },
      {
        id: 3,
        first_name: 'tom',
        last_name: 'liu',
      },
      {
        id: 4,
        first_name: 'tom',
        email: 'user01@rc.com',
      },
    ] as Person[]);
  }
  beforeEach(() => {
    clearMocks();
  });

  describe('buildPersonEntityCacheController', () => {
    it('should return PersonEntityCacheController', () => {
      const personService: any = new PersonService();
      expect(
        PersonEntityCacheController.buildPersonEntityCacheController(
          personService,
        ),
      ).toBeInstanceOf(PersonEntityCacheController);
    });
  });

  describe('initialize', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('initial state should be false before init', () => {
      expect(personEntityCacheController.isInitialized()).toBeFalsy();
    });

    it('initial state should be true after init ', () => {
      personEntityCacheController.initialize([]);
      expect(personEntityCacheController.isInitialized()).toBeTruthy();
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      prepareForPersonData();
    });

    it('should clear all data after clear', async () => {
      expect(await personEntityCacheController.getEntities()).not.toEqual([]);
      expect(personEntityCacheController.getSoundexById(2)).not.toEqual([]);

      await personEntityCacheController.clear();

      expect(await personEntityCacheController.getEntities()).toEqual([]);
      expect(personEntityCacheController.getSoundexById(2)).toEqual([]);
    });
  });

  describe('getSoundexById', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      prepareForPersonData();
    });

    it('should return soundex value of display_name as expected when person has display_name', () => {
      expect(personEntityCacheController.getSoundexById(2)).toEqual([
        soundex('bruce'),
        soundex('wang'),
      ]);
    });

    it('should return soundex value of first_name and last_name when person has first_name and last_name but no display_name', () => {
      expect(personEntityCacheController.getSoundexById(3)).toEqual([
        soundex('tom'),
        soundex('liu'),
      ]);
    });

    it('should return soundex value of email as expected when person has no name', () => {
      expect(personEntityCacheController.getSoundexById(4)).toEqual([
        soundex('user01@rc.com'),
      ]);
    });
  });

  describe('updatePartial', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should add to cache when is not a new person', () => {
      const entities = [
        {
          id: 4,
          display_name: 'rock chen',
        },
      ];
      personEntityCacheController.updateEx(entities);
      expect(personEntityCacheController.getSoundexById(4)).toEqual([
        soundex('rock'),
        soundex('chen'),
      ]);
    });

    it('should add to cache when is a new person', () => {
      const entities = [
        {
          id: 5,
          display_name: 'rock chen',
        },
      ];
      personEntityCacheController.updateEx(entities);
      expect(personEntityCacheController.getSoundexById(5)).toEqual([
        soundex('rock'),
        soundex('chen'),
      ]);
    });
  });
});
