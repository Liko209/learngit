/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-17 14:17:10
 * Copyright © RingCentral. All rights reserved.
 */

import { PersonEntityCacheController } from '../PersonEntityCacheController';
import { AccountUserConfig } from '../../../../module/account/config/AccountUserConfig';
import { Person } from '../../entity';
import { PersonService } from '../../service/PersonService';
import { ServiceLoader } from 'sdk/module/serviceLoader';
const soundex = require('soundex-code');

jest.mock('../../../../module/account/config');
jest.mock('../../../../api');
jest.mock('sdk/dao');

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

  describe('_addPhoneNumbers', () => {
    it('should add ext and direct number to cache', () => {
      setUp();
      const person: Person = {
        id: 39,
        company_id: 1,
        sanitized_rc_extension: {
          extensionNumber: '39',
          type: 'User',
        },
        rc_phone_numbers: [
          {
            id: 39,
            phoneNumber: '8885287464',
            usageType: 'MainCompanyNumber',
          },
          { id: 39, phoneNumber: '6502270039', usageType: 'DirectNumber' },
        ],
      };
      ServiceLoader.getInstance = jest.fn().mockReturnValueOnce({
        userConfig: { getCurrentCompanyId: jest.fn().mockReturnValueOnce(1) },
      });
      const shortNumCache = new Map();
      const longNumCache = new Map();
      Object.assign(personEntityCacheController, {
        _shortNumberCache: shortNumCache,
        _longNumberCache: longNumCache,
      });
      shortNumCache.set = jest.fn();
      longNumCache.set = jest.fn();
      personEntityCacheController._addPhoneNumbers(person);
      expect(shortNumCache.set).toBeCalledWith('39', person);
      expect(longNumCache.set).toBeCalledWith('6502270039', person);
      expect(longNumCache.set).toBeCalledTimes(1);
    });
  });

  describe('_removePhoneNumbersByPerson', () => {
    it('should remove ext and direct num from cache', () => {
      setUp();
      const person: Person = {
        id: 39,
        company_id: 1,
        sanitized_rc_extension: {
          extensionNumber: '39',
          type: 'User',
        },
        rc_phone_numbers: [
          {
            id: 39,
            phoneNumber: '8885287464',
            usageType: 'MainCompanyNumber',
          },
          { id: 39, phoneNumber: '6502270039', usageType: 'DirectNumber' },
        ],
      };
      ServiceLoader.getInstance = jest.fn().mockReturnValueOnce({
        userConfig: { getCurrentCompanyId: jest.fn().mockReturnValueOnce(1) },
      });
      const shortNumCache = new Map();
      const longNumCache = new Map();
      Object.assign(personEntityCacheController, {
        _shortNumberCache: shortNumCache,
        _longNumberCache: longNumCache,
      });
      shortNumCache.delete = jest.fn();
      longNumCache.delete = jest.fn();
      personEntityCacheController._removePhoneNumbersByPerson(person);
      expect(shortNumCache.delete).toBeCalledWith('39');
      expect(longNumCache.delete).toBeCalledWith('6502270039');
      expect(longNumCache.delete).toBeCalledTimes(1);
    });
  });

  describe('getPersonByPhoneNumber', () => {
    let shortNumCache: Map<string, Person>;
    let longNumCache: Map<string, Person>;
    beforeEach(() => {
      setUp();
      shortNumCache = new Map();
      longNumCache = new Map();
      Object.assign(personEntityCacheController, {
        _shortNumberCache: shortNumCache,
        _longNumberCache: longNumCache,
      });
      shortNumCache.get = jest.fn();
      longNumCache.get = jest.fn();
    });

    it('should get person from short num cache', () => {
      personEntityCacheController.getPersonByPhoneNumber('123', true);
      expect(shortNumCache.get).toBeCalled();
    });

    it('should get person from long num cache', () => {
      personEntityCacheController.getPersonByPhoneNumber('123', false);
      expect(longNumCache.get).toBeCalled();
    });
  });
});
