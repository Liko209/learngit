/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-23 13:23:00
 * Copyright © RingCentral. All rights reserved.
 */

import { PersonController } from '../PersonController';
import { daoManager } from '../../../../dao';
import { PersonDao } from '../../dao';
import { Person, PHONE_NUMBER_TYPE } from '../../entity';
import { personFactory } from '../../../../__tests__/factories';

import PersonAPI from '../../../../api/glip/person';

import {
  buildEntitySourceController,
  buildEntityCacheSearchController,
  buildEntityCacheController,
  buildEntityPersistentController,
} from '../../../../framework/controller';
import { IEntityPersistentController } from '../../../../framework/controller/interface/IEntityPersistentController';
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';
import { IEntityCacheController } from '../../../../framework/controller/interface/IEntityCacheController';
import { IEntityCacheSearchController } from '../../../../framework/controller/interface/IEntityCacheSearchController';
import { FEATURE_TYPE, FEATURE_STATUS } from '../../../group/entity';
import { GlobalConfigService } from '../../../../module/config';
import { AccountUserConfig } from '../../../../service/account/config';
import { ContactType } from '../../types';
import { SearchUtils } from '../../../../framework/utils/SearchUtils';

jest.mock('../../../../module/config');
jest.mock('../../../../service/account/config');

jest.mock('../../../../module/group');
jest.mock('../../../../service/notificationCenter');
jest.mock('../../../../dao/DaoManager');

GlobalConfigService.getInstance = jest.fn();

describe('PersonService', () => {
  let personController: PersonController;
  let personDao: PersonDao;

  let entityPersistentController: IEntityPersistentController<Person>;
  let entitySourceController: IEntitySourceController<Person>;
  let entityCacheController: IEntityCacheController<Person>;
  let cacheSearchController: IEntityCacheSearchController<Person>;

  function setUp() {
    personController = new PersonController();
    personDao = new PersonDao(null);

    entityCacheController = buildEntityCacheController<Person>();
    entityPersistentController = buildEntityPersistentController<Person>(
      personDao,
      entityCacheController,
    );
    entitySourceController = buildEntitySourceController<Person>(
      entityPersistentController,
    );
    cacheSearchController = buildEntityCacheSearchController<Person>(
      entityCacheController,
    );

    personController.setDependentController(
      entitySourceController,
      cacheSearchController,
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    setUp();
  });

  describe('getPersonsByIds()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
      setUp();
    });

    const person1: Person = {
      id: 1,
      created_at: 1,
      modified_at: 1,
      creator_id: 1,
      is_new: false,
      has_registered: true,
      version: 1,
      company_id: 1,
      email: 'cat1@ringcentral.com',
      me_group_id: 1,
      first_name: 'dora1',
      last_name: 'bruce1',
      display_name: 'dora1 bruce1',
    };

    const person2: Person = {
      id: 2,
      created_at: 2,
      modified_at: 2,
      creator_id: 2,
      is_new: false,
      has_registered: true,
      version: 2,
      company_id: 1,
      email: 'cat2@ringcentral.com',
      me_group_id: 2,
      first_name: 'dora2',
      last_name: 'bruce2',
      display_name: 'dora2 bruce2',
    };

    it('should return all matched person', async () => {
      entitySourceController.batchGet = jest.fn();
      entitySourceController.batchGet.mockImplementation(() => {
        return [person1, person2];
      });
      const result = await personController.getPersonsByIds([1, 2]);
      expect(entitySourceController.batchGet).toBeCalledWith([1, 2]);
      expect(result).toEqual([person1, person2]);
    });

    it('should return [] when no id was given', async () => {
      const result = await personController.getPersonsByIds([]);
      expect(result).toEqual([]);
    });
  });

  describe('getAllCount()', () => {
    it('should return all matched person length', async () => {
      const mock = 3;
      daoManager.getDao.mockReturnValue(personDao);
      personDao.getAllCount = jest.fn();
      personDao.getAllCount.mockReturnValue(mock);
      const result = await personController.getAllCount();
      expect(result).toBe(mock);
    });
  });

  describe('buildPersonFeatureMap()', () => {
    const personId = 1;
    const person = { id: personId };
    it('should not have conference permission for person', async () => {
      const spy = jest.spyOn(entitySourceController, 'get');
      spy.mockResolvedValueOnce(person);
      const res = await personController.buildPersonFeatureMap(personId);
      expect(res.get(FEATURE_TYPE.CONFERENCE)).toBeFalsy;
      expect(spy).toBeCalled;
    });

    it('should have message for person', async () => {
      const spy = jest.spyOn(entitySourceController, 'get');
      spy.mockResolvedValueOnce(person);
      const res = await personController.buildPersonFeatureMap(personId);
      expect(res.get(FEATURE_TYPE.MESSAGE)).toBe(FEATURE_STATUS.ENABLE);
      expect(spy).toBeCalledWith(person.id);
    });

    it('should not have message for pseudo person', async () => {
      const pseudoPerson = { id: personId, is_pseudo_user: true };
      const spy = jest.spyOn(entitySourceController, 'get');
      spy.mockResolvedValueOnce(pseudoPerson);
      const res = await personController.buildPersonFeatureMap(personId);
      expect(res.get(FEATURE_TYPE.MESSAGE)).toBe(FEATURE_STATUS.INVISIBLE);
      expect(spy).toBeCalledWith(pseudoPerson.id);
    });
  });

  describe('getAvailablePhoneNumbers()', () => {
    const rcPhoneNumbers = [
      { id: 11, phoneNumber: '1', usageType: 'MainCompanyNumber' },
      { id: 11, phoneNumber: '2', usageType: 'CompanyNumber' },
      { id: 11, phoneNumber: '3', usageType: 'AdditionalCompanyNumber' },
      { id: 11, phoneNumber: '4', usageType: 'ForwardedNumber' },
      { id: 11, phoneNumber: '5', usageType: 'MainCompanyNumber' },
      { id: 12, phoneNumber: '234567', usageType: 'DirectNumber' },
    ];
    const sanitizedRCExtension = { extensionNumber: '4711', type: 'User' };
    const ext = {
      type: PHONE_NUMBER_TYPE.EXTENSION_NUMBER,
      phoneNumber: '4711',
    };
    const did = {
      type: PHONE_NUMBER_TYPE.DIRECT_NUMBER,
      phoneNumber: '234567',
    };

    beforeEach(() => {
      AccountUserConfig.prototype.getGlipUserId = jest.fn().mockReturnValue(1);
      AccountUserConfig.prototype.getCurrentCompanyId = jest
        .fn()
        .mockReturnValue(1);
    });

    it('should not return extension id for guest user', () => {
      expect(
        personController.getAvailablePhoneNumbers(
          123,
          rcPhoneNumbers,
          sanitizedRCExtension,
        ),
      ).toEqual([did]);
    });

    it.each([
      [rcPhoneNumbers, sanitizedRCExtension, [ext, did]],
      [rcPhoneNumbers, undefined, [did]],
      [undefined, sanitizedRCExtension, [ext]],
    ])(
      'should return all available phone numbers, case index: %#',
      (rcPhones, rcExt, expectRes) => {
        expect(
          personController.getAvailablePhoneNumbers(1, rcPhones, rcExt),
        ).toEqual(expectRes);
      },
    );
  });
  describe('getEmailAsName()', () => {
    it('should return name when email validate', () => {
      const firstName = 'Bruce';
      const lastName = 'Chen';
      const person = personFactory.build({
        email: `${firstName}.${lastName}@ringcentral.com`,
      });
      const result = personController.getEmailAsName(person);
      expect(result).toEqual(`${firstName} ${lastName}`);
    });
    it('should return empty string while no email info', () => {
      const person = personFactory.build({
        email: null,
      });
      const result = personController.getEmailAsName(person);
      expect(result).toEqual('');
    });
    it("should convert name's first letter to UpperCase", () => {
      const firstName = 'bruce';
      const lastName = 'chen';
      const person = personFactory.build({
        email: `${firstName}.${lastName}@ringcentral.com`,
      });
      const result = personController.getEmailAsName(person);
      expect(result).toEqual('Bruce Chen');
    });
  });
  describe('getFullName()', () => {
    it('should return displayName first', () => {
      const displayName = 'Bruce Chen';
      const firstName = 'Niki';
      const lastName = 'Rao';
      const email = 'Dog.Mao@ringcentral.com';
      expect(
        personController.getFullName(
          personFactory.build({
            email,
            display_name: displayName,
            first_name: firstName,
            last_name: lastName,
          }),
        ),
      ).toEqual(displayName);
    });
    it('should return LastName FirstName after displayName', () => {
      const firstName = 'Bruce';
      const lastName = 'Chen';
      const email = 'Dog.Mao@ringcentral.com';
      expect(
        personController.getFullName(
          personFactory.build({
            email,
            display_name: '',
            first_name: firstName,
            last_name: lastName,
          }),
        ),
      ).toEqual(`${firstName} ${lastName}`);
    });
    it('should return name of email after displayName and FirstName LastName', () => {
      const email = 'Bruce.Chen@ringcentral.com';
      expect(
        personController.getFullName(
          personFactory.build({ email, first_name: '', last_name: '' }),
        ),
      ).toEqual('Bruce Chen');
    });
  });

  describe('getHeadShotWithSize()', () => {
    const originalURL = 'https://glip.com/original.jpg';
    const thumbsSize64 = 'https://glip.com/thumbs64.jpg';
    const thumbsSize92 = 'https://glip.com/thumbs92.jpg';
    const thumbsSize150 = 'https://glip.com/thumbs150.jpg';
    const thumbsSizeX = 'https://glip.com/thumbsx.jpg';
    const serverUrl = 'https://glip.com/headurl.jpg';

    beforeEach(() => {
      jest.spyOn(PersonAPI, 'getHeadShotUrl').mockReturnValueOnce(serverUrl);
    });

    it('should return url when desired size is found in thumbs without stored_file_id', () => {
      const thumbsString = {
        'height-13942071308size=16x16': 16,
        'width-13942071308size=24x24': 24,
        '123size=100x100': thumbsSizeX,
        '123size=64': thumbsSize64,
        '123size=92': thumbsSize92,
        '123size=150': thumbsSize150,
      };

      const headshot = {
        thumbs: thumbsString,
        url: URL,
      };
      const url = personController.getHeadShotWithSize(1, 'xx', headshot, 150);
      expect(url).toBe(thumbsSize150);
    });

    it('should return url when desired size is found in thumbs with stored_file_id', () => {
      const thumbsString = {
        'height-13942071308size=16x16': 16,
        'width-13942071308size=24x24': 24,
        '123size=100x100': thumbsSizeX,
        '123size=64': thumbsSize64,
        '123size=92': thumbsSize92,
        '123size=150': thumbsSize150,
      };

      const headshot = {
        thumbs: thumbsString,
        url: originalURL,
        stored_file_id: '123',
      };
      const url = personController.getHeadShotWithSize(1, 'xx', headshot, 150);
      expect(url).toBe(thumbsSize150);
    });

    it('should return url from server when there is no thumbs', () => {
      const headshot = {
        url: originalURL,
      };
      const url = personController.getHeadShotWithSize(1, 'xx', headshot, 150);
      expect(url).toBe(serverUrl);
    });

    it('should return url from server when thumbs is invalid', () => {
      const thumbsString = {
        '123size=100x100': thumbsSizeX,
        'height-13942071308size=16x16': 16,
      };
      const headshot = {
        url: originalURL,
        thumbs: thumbsString,
      };
      const url = personController.getHeadShotWithSize(1, 'xx', headshot, 150);
      expect(url).toBe(serverUrl);
    });

    it('should return url from server when desired size is not found in thumbs', () => {
      const thumbsString = {
        'height-13942071308size=16x16': 16,
        'width-13942071308size=24x24': 24,
        '123size=100x100': thumbsSizeX,
        '123size=64': thumbsSize64,
        '123size=92': thumbsSize92,
      };

      const headshot = {
        thumbs: thumbsString,
        url: originalURL,
        stored_file_id: '123',
      };
      const url = personController.getHeadShotWithSize(1, 'xx', headshot, 150);
      expect(url).toBe(serverUrl);
    });

    it('should return original url when desired size is not found in thumbs and no headshot version is specified', () => {
      const thumbsString = {
        'height-13942071308size=16x16': 16,
        'width-13942071308size=24x24': 24,
        '123size=100x100': thumbsSizeX,
        '123size=64': thumbsSize64,
        '123size=92': thumbsSize92,
      };

      const headshot = {
        thumbs: thumbsString,
        url: originalURL,
        stored_file_id: '123',
      };
      const url = personController.getHeadShotWithSize(1, '', headshot, 150);
      expect(url).toBe(originalURL);
    });

    it('should return original url when desired size is not found in thumbs and fail to get url from server', () => {
      const thumbsString = {
        'height-13942071308size=16x16': 16,
        'width-13942071308size=24x24': 24,
        '123size=100x100': thumbsSizeX,
        '123size=64': thumbsSize64,
        '123size=92': thumbsSize92,
      };

      const headshot = {
        thumbs: thumbsString,
        url: originalURL,
        stored_file_id: '123',
      };
      jest.clearAllMocks();
      jest.resetAllMocks();

      jest.spyOn(PersonAPI, 'getHeadShotUrl').mockReturnValueOnce(null);

      const url = personController.getHeadShotWithSize(1, '', headshot, 150);
      expect(url).toBe(originalURL);
    });

    it('should return url when headshot is an url string', () => {
      const headshot = originalURL;
      const url = personController.getHeadShotWithSize(1, '', headshot, 150);
      expect(url).toBe(originalURL);
    });
  });

  describe('matchContactByPhoneNumber', () => {
    async function prepareInvalidData() {
      for (let i = 1; i <= 30; i += 1) {
        const person: Person = {
          id: i,
          created_at: i,
          modified_at: i,
          creator_id: i,
          is_new: false,
          version: i,
          company_id: 1,
          email: `cat${i.toString()}@ringcentral.com`,
          first_name: `dora${i.toString()}`,
          last_name: `bruce${i.toString()}`,
          display_name: `dora${i.toString()} bruce${i.toString()}`,
        };
        await entityCacheController.put(person);
      }
    }
    async function preparePhoneNumData() {
      for (let i = 1; i <= 30; i += 1) {
        const person: Person = {
          id: i,
          created_at: i,
          modified_at: i,
          creator_id: i,
          is_new: false,
          version: i,
          company_id: 1,
          email: `cat${i.toString()}@ringcentral.com`,
          first_name: `dora${i.toString()}`,
          last_name: `bruce${i.toString()}`,
          display_name: `dora${i.toString()} bruce${i.toString()}`,
          sanitized_rc_extension: {
            extensionNumber: `${i}`,
            type: 'User',
          },
        };
        await entityCacheController.put(person);
      }
      for (let i = 31; i <= 35; i += 1) {
        const person: Person = {
          id: i,
          created_at: i,
          modified_at: i,
          creator_id: i,
          is_new: false,
          version: i,
          company_id: 1,
          email: `cat${i.toString()}@ringcentral.com`,
          first_name: `dora${i.toString()}`,
          last_name: `bruce${i.toString()}`,
          display_name: `dora${i.toString()} bruce${i.toString()}`,
          rc_phone_numbers: [
            { id: i, phoneNumber: `65022700${i}`, usageType: 'DirectNumber' },
          ],
        };
        await entityCacheController.put(person);
      }
      for (let i = 36; i <= 37; i += 1) {
        const person: Person = {
          id: i,
          created_at: i,
          modified_at: i,
          creator_id: i,
          is_new: false,
          version: i,
          company_id: 1,
          email: `cat${i.toString()}@ringcentral.com`,
          first_name: `dora${i.toString()}`,
          last_name: `bruce${i.toString()}`,
          display_name: `dora${i.toString()} bruce${i.toString()}`,
          rc_phone_numbers: [
            {
              id: i,
              phoneNumber: '8885287464',
              usageType: 'MainCompanyNumber',
            },
            { id: i, phoneNumber: `65022700${i}`, usageType: 'DirectNumber' },
          ],
        };
        await entityCacheController.put(person);
      }
    }

    beforeEach(async () => {
      jest.clearAllMocks();
      jest.resetAllMocks();
      setUp();
      SearchUtils.isUseSoundex = jest.fn().mockReturnValue(false);
    });
    it('should return null when there is no phone number data', async () => {
      await prepareInvalidData();
      const result = await personController.matchContactByPhoneNumber(
        '123',
        ContactType.GLIP_CONTACT,
      );
      expect(result).toBeNull();
    });
    it('should return null when no one is matched', async () => {
      await prepareInvalidData();
      const result = await personController.matchContactByPhoneNumber(
        '6502274787',
        ContactType.GLIP_CONTACT,
      );
      expect(result).toBeNull();
    });
    it('should return when short number is matched', async () => {
      await preparePhoneNumData();
      const result = await personController.matchContactByPhoneNumber(
        '21',
        ContactType.GLIP_CONTACT,
      );
      expect(result).not.toBeNull();
      expect(result.id).toBe(21);
    });
    it('should return when long number is matched', async () => {
      await preparePhoneNumData();
      const result = await personController.matchContactByPhoneNumber(
        '6502270033',
        ContactType.GLIP_CONTACT,
      );
      expect(result).not.toBeNull();
      expect(result.id).toBe(33);
    });
    it('should return when there is two more long number and long number is matched', async () => {
      await preparePhoneNumData();
      const result = await personController.matchContactByPhoneNumber(
        '6502270036',
        ContactType.GLIP_CONTACT,
      );
      expect(result).not.toBeNull();
      expect(result.id).toBe(36);
    });
  });

  describe('refreshPersonData()', () => {
    it('should call get once when has requestController', async () => {
      const requestController = {
        get: jest.fn().mockResolvedValue({}),
      };
      jest
        .spyOn(entitySourceController, 'getRequestController')
        .mockReturnValue(requestController);
      personController.refreshPersonData(1);
      expect(requestController.get).toHaveBeenCalledTimes(1);
    });
  });
});
