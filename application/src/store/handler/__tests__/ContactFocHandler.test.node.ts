/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-08-22 18:12:34
 * Copyright © RingCentral. All rights reserved.
 */

import { ContactFocHandler } from '../ContactFocHandler';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { Person } from 'sdk/module/person/entity';
import { SortUtils } from 'sdk/framework/utils';

describe('ContactFocHandler', () => {
  const personService = {
    getEntities: jest.fn(),
    getFullName: jest.fn(),
    isVisiblePerson: jest.fn(),
    getEntitySource: jest.fn(),
  };

  const entitySourceController = {
    getEntityName: jest.fn().mockReturnValue('Test'),
    getEntities: jest.fn(),
    getEntityNotificationKey: jest.fn(),
  };

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }

  beforeEach(() => {
    clearMocks();
    ServiceLoader.getInstance = jest.fn().mockImplementation(() => {
      return personService;
    });
  });

  it('should call create/dispose foc', () => {
    const handler = new ContactFocHandler();
    personService.getEntitySource.mockReturnValue(entitySourceController);
    const foc = handler.getFoc();
    const spyOnDispose = jest.spyOn(foc, 'dispose');
    handler.dispose();
    expect(spyOnDispose).toHaveBeenCalled();
  });

  it('should call sort/filter foc', () => {
    const handler = new ContactFocHandler();
    entitySourceController.getEntities;
    personService.getEntitySource.mockReturnValue(entitySourceController);
    personService.isVisiblePerson = jest.fn().mockImplementation(() => {
      return true;
    });
    expect(handler.filterFunc({ id: 1 } as Person)).toBe(true);
    personService.getFullName = jest
      .fn()
      .mockImplementation((person: Person) => {
        if (person.id === 1) {
          return 'cbc';
        }
        if (person.id === 2) {
          return 'bca';
        }
        return '';
      });

    SortUtils.compareString = jest.fn();
    handler.sortFunc(
      { id: 1, sortValue: 0, data: { id: 1 } as Person },
      { id: 2, sortValue: 0, data: { id: 2 } as Person },
    );
    expect(SortUtils.compareString).toHaveBeenCalledWith('cbc', 'bca');
  });
});
