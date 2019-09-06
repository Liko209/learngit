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
} from 'sdk/framework/controller';
import { IEntityPersistentController } from 'sdk/framework/controller/interface/IEntityPersistentController';
import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
import { IEntityCacheController } from 'sdk/framework/controller/interface/IEntityCacheController';
import { IEntityCacheSearchController } from 'sdk/framework/controller/interface/IEntityCacheSearchController';
import { FEATURE_TYPE, FEATURE_STATUS } from '../../../group/entity';
import { GlobalConfigService } from 'sdk/module/config';
import { AccountUserConfig } from 'sdk/module/account/config/AccountUserConfig';
import { AuthUserConfig } from 'sdk/module/account/config/AuthUserConfig';
import { ContactType } from '../../types';
import { SearchUtils } from 'sdk/framework/utils/SearchUtils';
import { PhoneParserUtility } from 'sdk/utils/phoneParser';
import { PersonEntityCacheController } from '../PersonEntityCacheController';
import { PersonService } from '../..';
import { PhoneNumberService } from 'sdk/module/phoneNumber';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { PhoneNumber, PhoneNumberType } from 'sdk/module/phoneNumber/entity';
import { AccountService } from 'sdk/module/account';
import { PersonActionController } from '../PersonActionController';

jest.mock('sdk/module/config');
jest.mock('sdk/module/account/config');

jest.mock('sdk/module/group');
jest.mock('sdk/service/notificationCenter');
jest.mock('../../../../dao/DaoManager');
jest.mock('sdk/module/phoneNumber');
jest.mock('sdk/utils/phoneParser');

describe('PersonService', () => {
  let personController: PersonController;
  let personDao: PersonDao;

  let entityPersistentController: IEntityPersistentController<Person>;
  let entitySourceController: IEntitySourceController<Person>;
  let entityCacheController: IEntityCacheController<Person>;
  let cacheSearchController: IEntityCacheSearchController<Person>;
  let phoneNumberService: PhoneNumberService;

  function setUp() {
    phoneNumberService = new PhoneNumberService(true);
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        if (config === ServiceConfig.ACCOUNT_SERVICE) {
          return {
            userConfig: AccountUserConfig.prototype,
            authUserConfig: AuthUserConfig.prototype,
          };
        }
        if (config === ServiceConfig.PHONE_NUMBER_SERVICE) {
          return phoneNumberService;
        }
      });
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
      entityCacheController,
    );
  }

  function getPerson() {
    const person: Person = {
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
      sanitized_rc_extension: {
        extensionNumber: '98494',
        type: 'User',
      },
      rc_phone_numbers: [
        { id: 1, phoneNumber: '650425743', usageType: 'DirectNumber' },
      ],
    };

    return person;
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
      expect(entitySourceController.batchGet).toHaveBeenCalledWith([1, 2]);
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
      expect(spy).toHaveBeenCalled;
    });

    it('should have message for person', async () => {
      const spy = jest.spyOn(entitySourceController, 'get');
      spy.mockResolvedValueOnce(person);
      const res = await personController.buildPersonFeatureMap(personId);
      expect(res.get(FEATURE_TYPE.MESSAGE)).toBe(FEATURE_STATUS.ENABLE);
      expect(spy).toHaveBeenCalledWith(person.id);
    });

    it('should not have message for pseudo person', async () => {
      const pseudoPerson = { id: personId, is_pseudo_user: true };
      const spy = jest.spyOn(entitySourceController, 'get');
      spy.mockResolvedValueOnce(pseudoPerson);
      const res = await personController.buildPersonFeatureMap(personId);
      expect(res.get(FEATURE_TYPE.MESSAGE)).toBe(FEATURE_STATUS.INVISIBLE);
      expect(spy).toHaveBeenCalledWith(pseudoPerson.id);
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
    it('should not return displayName', () => {
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
      ).toEqual('Niki Rao');
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
    const gifUrl = 'https://glip.com/test.gif?test=1';

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
        url: originalURL,
      };
      const url = personController.getHeadShotWithSize(1, headshot, 150, 123);
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
      const url = personController.getHeadShotWithSize(1, headshot, 150, 123);
      expect(url).toBe(thumbsSize150);
    });

    it('should return url from server when there is no thumbs', () => {
      const headshot = {
        url: originalURL,
      };
      const url = personController.getHeadShotWithSize(1, headshot, 150, 123);
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
      const url = personController.getHeadShotWithSize(1, headshot, 150, 123);
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
      const url = personController.getHeadShotWithSize(1, headshot, 150, 123);
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
      const url = personController.getHeadShotWithSize(1, headshot, 150);
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

      const url = personController.getHeadShotWithSize(1, headshot, 150);
      expect(url).toBe(originalURL);
    });

    it('should return url when headshot is an url string', () => {
      const headshot = originalURL;
      const url = personController.getHeadShotWithSize(1, headshot, 150);
      expect(url).toBe(originalURL);
    });

    it('should return url when headshot is an url string and headshot_version exist', () => {
      const headshot = originalURL;
      const url = personController.getHeadShotWithSize(1, headshot, 150, 123);
      expect(url).toBe(originalURL);
    });

    it('should return original url when the original headshot is gif', () => {
      const headshot = {
        url: gifUrl,
        stored_file_id: '123',
      };
      const url = personController.getHeadShotWithSize(1, headshot, 150);
      expect(url).toBe(gifUrl);
    });

    it('should return original url when the headshot is string and the original url is gif', () => {
      const headshot = gifUrl;
      const url = personController.getHeadShotWithSize(1, headshot, 150, 123);
      expect(url).toBe(gifUrl);
    });
  });

  describe('matchContactByPhoneNumber', () => {
    const personEntityCacheController = new PersonEntityCacheController(
      new PersonService(),
    );
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
        await personEntityCacheController.put(person);
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
        await personEntityCacheController.put(person);
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
        await personEntityCacheController.put(person);
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
        await personEntityCacheController.put(person);
      }

      const deactivatedPerson2: Person = {
        id: 39,
        created_at: 39,
        modified_at: 39,
        creator_id: 39,
        is_new: false,
        version: 39,
        company_id: 1,
        email: 'deactivatedPerson2@ringcentral.com',
        first_name: 'deactivatedPerson2',
        last_name: 'deactivatedPerson2',
        display_name: 'deactivatedPerson2',
        flags: 6,
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
      await personEntityCacheController.put(deactivatedPerson2);

      const deactivatedPerson1: Person = {
        id: 38,
        created_at: 38,
        modified_at: 38,
        creator_id: 38,
        is_new: false,
        version: 38,
        company_id: 1,
        email: 'deactivatedPerson1@ringcentral.com',
        first_name: 'deactivatedPerson1',
        last_name: 'deactivatedPerson1',
        display_name: 'deactivatedPerson1',
        deactivated: true,
        rc_phone_numbers: [
          {
            id: 38,
            phoneNumber: '8885287464',
            usageType: 'MainCompanyNumber',
          },
          { id: 38, phoneNumber: '6502270038', usageType: 'DirectNumber' },
        ],
      };
      await personEntityCacheController.put(deactivatedPerson1);
    }

    beforeEach(async () => {
      jest.clearAllMocks();
      jest.resetAllMocks();
      setUp();

      personController.setDependentController(
        entitySourceController,
        cacheSearchController,
        personEntityCacheController,
      );
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

    it('should return when both short number and company id are matched', async () => {
      PhoneParserUtility.getPhoneParser = jest.fn().mockReturnValue({
        isShortNumber: jest.fn().mockReturnValue(true),
        getE164: jest.fn().mockReturnValue('21'),
      });
      phoneNumberService.generateMatchedPhoneNumberList = jest
        .fn()
        .mockReturnValue(['21']);
      AccountUserConfig.prototype.getCurrentCompanyId = jest
        .fn()
        .mockReturnValue(1);
      await preparePhoneNumData();
      const result = await personController.matchContactByPhoneNumber(
        '21',
        ContactType.GLIP_CONTACT,
      );
      expect(result).not.toBeNull();
      expect(result.id).toBe(21);
    });

    it('should not return when short number is matched, but company not', async () => {
      AccountUserConfig.prototype.getCurrentCompanyId = jest
        .fn()
        .mockReturnValueOnce(2);
      await preparePhoneNumData();
      const result = await personController.matchContactByPhoneNumber(
        '21',
        ContactType.GLIP_CONTACT,
      );
      expect(result).toBeNull();
    });

    it('should return when long number is matched', async () => {
      PhoneParserUtility.getPhoneParser = jest.fn().mockReturnValue({
        isShortNumber: jest.fn().mockReturnValue(false),
        getE164: jest.fn().mockReturnValue('+16502270033'),
        isSpecialNumber: jest.fn().mockReturnValue(false),
      });
      phoneNumberService.generateMatchedPhoneNumberList = jest
        .fn()
        .mockReturnValue([
          '+16502270033',
          '16502270033',
          '6502270033',
          '06502270033',
        ]);
      await preparePhoneNumData();
      const result = await personController.matchContactByPhoneNumber(
        '6502270033',
        ContactType.GLIP_CONTACT,
      );
      expect(result).not.toBeNull();
      expect(result.id).toBe(33);
    });

    it('should return when there is two more long number and long number is matched', async () => {
      PhoneParserUtility.getPhoneParser = jest.fn().mockReturnValue({
        isShortNumber: jest.fn().mockReturnValue(false),
        getE164: jest.fn().mockReturnValue('+16502270036'),
        isSpecialNumber: jest.fn().mockReturnValue(false),
      });
      await preparePhoneNumData();
      phoneNumberService.generateMatchedPhoneNumberList = jest
        .fn()
        .mockReturnValue([
          '+16502270036',
          '16502270036',
          '6502270036',
          '06502270036',
        ]);
      const result = await personController.matchContactByPhoneNumber(
        '6502270036',
        ContactType.GLIP_CONTACT,
      );
      expect(result).not.toBeNull();
      expect(result.id).toBe(36);
    });

    it('should not return when phone number matches, but user is deactivated', async () => {
      AccountUserConfig.prototype.getCurrentCompanyId = jest
        .fn()
        .mockReturnValueOnce(1);
      await preparePhoneNumData();
      const result = await personController.matchContactByPhoneNumber(
        '6502270038',
        ContactType.GLIP_CONTACT,
      );
      expect(result).toBeNull();
    });

    it('should not return when phone number matches, but user flag is deactivated', async () => {
      AccountUserConfig.prototype.getCurrentCompanyId = jest
        .fn()
        .mockReturnValueOnce(1);
      await preparePhoneNumData();
      const result = await personController.matchContactByPhoneNumber(
        '39',
        ContactType.GLIP_CONTACT,
      );
      expect(result).toBeNull();
    });

    it('should not match when phone number is not direct number', async () => {
      AccountUserConfig.prototype.getCurrentCompanyId = jest
        .fn()
        .mockReturnValueOnce(1);
      await preparePhoneNumData();
      const result = await personController.matchContactByPhoneNumber(
        '8885287464',
        ContactType.GLIP_CONTACT,
      );
      expect(result).toBeNull();
    });

    it('should match ext when special number is same as ext', async () => {
      PhoneParserUtility.getPhoneParser = jest.fn().mockReturnValue({
        isShortNumber: jest.fn().mockReturnValue(false),
        getE164: jest.fn().mockReturnValue('21'),
        isSpecialNumber: jest.fn().mockReturnValue(true),
      });
      phoneNumberService.generateMatchedPhoneNumberList = jest
        .fn()
        .mockReturnValue(['21']);
      AccountUserConfig.prototype.getCurrentCompanyId = jest
        .fn()
        .mockReturnValue(1);
      await preparePhoneNumData();
      const result = await personController.matchContactByPhoneNumber(
        '21',
        ContactType.GLIP_CONTACT,
      );
      expect(result).not.toBeNull();
      expect(result.id).toBe(21);
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

      entitySourceController.update = jest.fn();
      await personController.refreshPersonData(1);
      expect(entitySourceController.update).toHaveBeenCalled();
      expect(requestController.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getName', () => {
    it.each`
      displayName | firstName   | lastName    | email      | res
      ${'d_name'} | ${'f_name'} | ${'l_name'} | ${'email'} | ${'f_name l_name'}
      ${''}       | ${'f_name'} | ${'l_name'} | ${'email'} | ${'f_name l_name'}
      ${''}       | ${'f_name'} | ${''}       | ${'email'} | ${'f_name'}
      ${''}       | ${''}       | ${'l_name'} | ${'email'} | ${'l_name'}
      ${''}       | ${''}       | ${''}       | ${'email'} | ${''}
      ${''}       | ${''}       | ${''}       | ${''}      | ${''}
    `(
      'should return full name of the person $res ',
      ({ displayName, firstName, lastName, email, res }) => {
        const person: any = {
          email,
          display_name: displayName,
          first_name: firstName,
          last_name: lastName,
        };

        expect(personController.getName(person)).toEqual(res);
      },
    );
  });

  describe('getPhoneNumbers', () => {
    it('should return all phone numbers when is company contact, and extension is at first', () => {
      const person = getPerson();
      const userConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig;
      jest.spyOn(userConfig, 'getCurrentCompanyId').mockReturnValue(1);

      const phoneNumbers: PhoneNumber[] = [];
      personController.getPhoneNumbers(person, (phoneNumber: PhoneNumber) => {
        phoneNumbers.push(phoneNumber);
      });

      expect(phoneNumbers).toEqual([
        { id: '98494', phoneNumberType: PhoneNumberType.Extension },
        { id: '650425743', phoneNumberType: PhoneNumberType.DirectNumber },
      ]);
    });

    it('should only return DID when is a guest', () => {
      const person = getPerson();

      const userConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig;
      jest.spyOn(userConfig, 'getCurrentCompanyId').mockReturnValue(2);

      const phoneNumbers: PhoneNumber[] = [];
      personController.getPhoneNumbers(person, (phoneNumber: PhoneNumber) => {
        phoneNumbers.push(phoneNumber);
      });

      expect(phoneNumbers).toEqual([
        { id: '650425743', phoneNumberType: PhoneNumberType.DirectNumber },
      ]);
    });
  });

  describe('personActionController', () => {
    it('should return instance of PersonActionController', () => {
      expect(personController.personActionController).toBeInstanceOf(
        PersonActionController,
      );
    });
  });

  describe('getCurrentPerson', () => {
    it('should return current user depends on user id', async () => {
      setUp();
      const userConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig;
      jest.spyOn(userConfig, 'getGlipUserId').mockReturnValue(2);
      const person = getPerson();
      entitySourceController.get = jest.fn().mockReturnValueOnce(person);
      await personController.getCurrentPerson();
      expect(entitySourceController.get).toHaveBeenCalledWith(2);
    });
  });

  describe('getFirstName', () => {
    it.each`
      rcExtensionId | firstName   | lastName    | sRcFirstName | res
      ${''}         | ${'f_name'} | ${'l_name'} | ${'s_name'}  | ${'f_name'}
      ${'1'}        | ${'f_name'} | ${'l_name'} | ${'s_name'}  | ${'s_name'}
      ${'1'}        | ${'f_name'} | ${''}       | ${''}        | ${'f_name'}
    `(
      'should return first name of the person $res ',
      ({ rcExtensionId, firstName, lastName, sRcFirstName, res }) => {
        const person: any = {
          sanitized_rc_first_name: sRcFirstName,
          first_name: firstName,
          last_name: lastName,
          rc_extension_id: rcExtensionId,
        };
        expect(personController.getFirstName(person)).toEqual(res);
      },
    );
  });

  describe('getLastName', () => {
    it.each`
      rcExtensionId | firstName   | lastName    | sRcLastName | res
      ${''}         | ${'f_name'} | ${'l_name'} | ${'s_name'} | ${'l_name'}
      ${'1'}        | ${'f_name'} | ${'l_name'} | ${'s_name'} | ${'s_name'}
      ${'1'}        | ${'f_name'} | ${'l_name'} | ${''}       | ${'l_name'}
    `(
      'should return first name of the person $res ',
      ({ rcExtensionId, firstName, lastName, sRcLastName, res }) => {
        const person: any = {
          sanitized_rc_last_name: sRcLastName,
          first_name: firstName,
          last_name: lastName,
          rc_extension_id: rcExtensionId,
        };
        expect(personController.getLastName(person)).toEqual(res);
      },
    );
  });

  describe('isVisible', () => {
    const basicPerson = {
      id: 1,
      deactivated: false,
      flags: 0,
      email: 'g.com',
      is_pseudo_user: false,
      externally_registered: 'google',
    };

    const PersonFlags = {
      is_webmail: 1,
      deactivated: 2,
      has_registered: 4,
      externally_registered: 8,
      externally_registered_password_set: 16,
      rc_registered: 32,
      locked: 64,
      amazon_ses_suppressed: 128,
      is_kip: 256,
      has_bogus_email: 512,
      is_removed_guest: 1024,
      am_removed_guest: 2048,
      is_hosted: 4096,
      invited_by_me: 8192,
    };

    it.each`
      case |person                                                 | result
      ${'deactivated'}|${{ ...basicPerson, deactivated: true }}               | ${false}
      ${'service person'}|${{ ...basicPerson, email: 'service@glip.com' }}       | ${false}
      ${'not register'}|${{ ...basicPerson, flags: 0, externally_registered: 'google' }} | ${false} 
      ${'not register'}|${{ ...basicPerson, flags: PersonFlags.am_removed_guest,}} | ${false} 
      ${'not register'}|${{ ...basicPerson, flags: PersonFlags.is_removed_guest,}} | ${false} 
      ${'bogus email not rc login'}|${{ ...basicPerson, flags: PersonFlags.has_bogus_email, externally_registered: 'google' }} | ${false}
      ${'bogus email and rc login'}|${{ ...basicPerson, flags: PersonFlags.has_bogus_email, externally_registered: 'rc_signons' }} | ${true}
      ${'normal flag'}|${{ ...basicPerson, flags: PersonFlags.externally_registered, externally_registered: 'google' }} | ${true}
    `('should return $result when $case  ', ({ person, result }) => {
      expect(personController.isVisible(person)).toEqual(result);
    });
  });
});


