/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-22 13:30:00
 * Copyright © RingCentral. All rights reserved.
 */

import { PersonService } from '../PersonService';
import { PersonController } from '../../controller/PersonController';
import { Raw } from '../../../../framework/model';
import { Person } from '../../entity';
import { SYNC_SOURCE } from '../../../sync';
import { PhoneNumber } from 'sdk/module/phoneNumber/entity';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { object } from '@storybook/addon-knobs';

jest.mock('../../controller/PersonController');
jest.mock('../../../../api');
jest.mock('../../../../dao');
jest.mock('sdk/module/sync/config');

describe('PersonService', () => {
  it('should call controller with correct parameter', async () => {});

  let personService: PersonService;
  let personController: PersonController;

  function setup() {
    personService = new PersonService();
    personController = new PersonController();

    Object.assign(personService, {
      _personController: personController,
    });
  }

  function getPerson() {
    const person: Person = {
      id: 1,
      created_at: 2,
      modified_at: 2,
      creator_id: 1,
      is_new: false,
      has_registered: true,
      version: 1,
      company_id: 1,
      email: 'test@ringcentral.com',
      me_group_id: 1,
      first_name: 'jupiter',
      last_name: 'rc',
      display_name: 'jupiter rc',
    } as any;

    return person;
  }

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

  describe('handleIncomingData', () => {
    it('should call controller with correct parameter', async () => {
      const persons: Raw<Person>[] = [];
      await personService.handleIncomingData(persons, SYNC_SOURCE.INDEX);
      expect(personController.handleIncomingData).toHaveBeenCalledWith(
        persons,
        SYNC_SOURCE.INDEX,
        undefined,
      );
    });
  });

  describe('handleSocketIOData', () => {
    it('should call controller with correct parameter', async () => {
      const persons: Raw<Person>[] = [];
      await personService.handleSocketIOData(persons);
      expect(personController.handleIncomingData).toHaveBeenCalledWith(
        persons,
        SYNC_SOURCE.SOCKET,
      );
    });
  });

  describe('canRequest()', () => {
    it('should return true', () => {
      ServiceLoader.getInstance = jest
        .fn()
        .mockImplementation((serviceName: string) => {
          if (serviceName === ServiceConfig.SYNC_SERVICE) {
            return {
              getUserConfig: jest.fn().mockReturnValue({
                getFetchedRemaining: jest.fn().mockReturnValue(true),
              }),
            };
          }
          return null;
        });
      const result = personService['canRequest']();
      expect(result).toBeTruthy();
    });

    it('should return false', () => {
      ServiceLoader.getInstance = jest
        .fn()
        .mockImplementation((serviceName: string) => {
          if (serviceName === ServiceConfig.SYNC_SERVICE) {
            return {
              getUserConfig: jest.fn().mockReturnValue({
                getFetchedRemaining: jest.fn().mockReturnValue(false),
              }),
            };
          }
          return null;
        });
      const result = personService['canRequest']();
      expect(result).toBeFalsy();
    });
  });

  describe('getPersonsByIds', () => {
    it('should call controller with correct parameter', async () => {
      await personService.getPersonsByIds([1, 2, 3, 4, 5, 6]);
      expect(personController.getPersonsByIds).toHaveBeenCalledWith([
        1,
        2,
        3,
        4,
        5,
        6,
      ]);
    });
  });

  describe('getAllCount', () => {
    it('should call controller with correct parameter', async () => {
      await personService.getAllCount();
      expect(personController.getAllCount).toHaveBeenCalled();
    });
  });

  describe('getHeadShotWithSize', () => {
    it('should call controller with correct parameter', async () => {
      personService.getHeadShotWithSize(1, '', 150, 1111);
      expect(personController.getHeadShotWithSize).toHaveBeenCalledWith(
        1,
        '',
        150,
        1111,
      );
    });
  });

  describe('buildPersonFeatureMap', () => {
    it('should call controller with correct parameter', async () => {
      await personService.buildPersonFeatureMap(1);
      expect(personController.buildPersonFeatureMap).toHaveBeenCalledWith(1);
    });
  });

  describe('getName', () => {
    it('should call controller with correct parameter', async () => {
      const person = getPerson();
      personService.getName(person);
      expect(personController.getName).toHaveBeenCalledWith(person);

      personService.getEmailAsName(person);
      expect(personController.getEmailAsName).toHaveBeenCalledWith(person);

      personService.getFullName(person);
      expect(personController.getFullName).toHaveBeenCalledWith(person);
    });
  });

  describe('getAvailablePhoneNumbers', () => {
    it('should call controller with correct parameter', async () => {
      await personService.getAvailablePhoneNumbers(123);
      expect(personController.getAvailablePhoneNumbers).toHaveBeenCalledWith(
        123,
        undefined,
        undefined,
      );
    });
  });

  describe('refreshPersonData', () => {
    it('should call controller with correct parameter', async () => {
      personService.refreshPersonData(111);
      expect(personController.refreshPersonData).toHaveBeenCalledWith(111);
    });
  });

  describe('getById', () => {
    it('should receive null when id is not correct person id', async () => {
      try {
        await personService.getById(1);
      } catch (e) {
        expect(e).toBeNull();
      }
    });
  });

  describe('getPhoneNumbers', () => {
    it('should call with correct parameter', () => {
      const person = getPerson();
      const eachPhoneNumberFunc = (phoneNumber: PhoneNumber) => {};
      personService.getPhoneNumbers(person, eachPhoneNumberFunc);
      expect(personController.getPhoneNumbers).toHaveBeenCalledWith(
        person,
        eachPhoneNumberFunc,
      );
    });
  });

  describe('editPersonalInfo', () => {
    const mockAction = {
      editPersonalInfo: jest.fn(),
    };
    beforeEach(() => {
      Object.defineProperty(personController, 'personActionController', {
        get() {
          return mockAction;
        },
      });
    });
    it('should call api in person action controller', async () => {
      const data = { first_name: 'good' };
      await personService.editPersonalInfo(data);
      expect(
        personController.personActionController.editPersonalInfo,
      ).toHaveBeenCalledWith(data, undefined);
    });
  });
});
