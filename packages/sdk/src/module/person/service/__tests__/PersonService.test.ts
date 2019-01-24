/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-22 13:30:00
 * Copyright © RingCentral. All rights reserved.
 */

import { PersonService } from '../PersonService';
import { PersonController } from '../../controller/PersonController';
import { Raw } from '../../../../framework/model';
import { Person } from '../../entity';

jest.mock('../../controller/PersonController');
jest.mock('../../../../api');
jest.mock('../../../../dao');

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
      await personService.handleIncomingData(persons);
      expect(personController.handleIncomingData).toBeCalledWith(persons);
    });
  });

  describe('getPersonsByIds', () => {
    it('should call controller with correct parameter', async () => {
      await personService.getPersonsByIds([1, 2, 3, 4, 5, 6]);
      expect(personController.getPersonsByIds).toBeCalledWith([
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
      expect(personController.getAllCount).toBeCalled();
    });
  });

  describe('getHeadShot', () => {
    it('should call controller with correct parameter', async () => {
      personService.getHeadShot(1, '1111', 150);
      expect(personController.getHeadShot).toBeCalledWith(1, '1111', 150);
    });
  });

  describe('buildPersonFeatureMap', () => {
    it('should call controller with correct parameter', async () => {
      await personService.buildPersonFeatureMap(1);
      expect(personController.buildPersonFeatureMap).toBeCalledWith(1);
    });
  });

  describe('doFuzzySearchPersons', () => {
    it('should call controller with correct parameter', async () => {
      await personService.doFuzzySearchPersons('a', true, [1], true);
      expect(personController.doFuzzySearchPersons).toBeCalledWith(
        'a',
        true,
        [1],
        true,
      );
    });
  });

  describe('getName', () => {
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
    };

    it('should call controller with correct parameter', async () => {
      personService.getName(person);
      expect(personController.getName).toBeCalledWith(person);

      personService.getEmailAsName(person);
      expect(personController.getEmailAsName).toBeCalledWith(person);

      personService.getFullName(person);
      expect(personController.getFullName).toBeCalledWith(person);
    });
  });

  describe('getAvailablePhoneNumbers', () => {
    it('should call controller with correct parameter', async () => {
      await personService.getAvailablePhoneNumbers(123);
      expect(personController.getAvailablePhoneNumbers).toBeCalledWith(
        123,
        undefined,
        undefined,
      );
    });
  });
});
