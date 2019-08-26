/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-08-22 18:12:34
 * Copyright © RingCentral. All rights reserved.
 */

import { ContactFocHandler, CONTACT_TAB_TYPE } from '../ContactFocHandler';
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

  function setUp() {
    ServiceLoader.getInstance = jest.fn().mockImplementation(() => {
      return personService;
    });
  }

  beforeEach(() => {
    clearMocks();

    setUp();
  });

  it('should call create/dispose foc', () => {
    const handler = new ContactFocHandler();
    personService.getEntitySource.mockReturnValue(entitySourceController);
    const foc = handler.getFoc();
    const spyOnDispose = jest.spyOn(foc, 'dispose');
    handler.dispose();
    expect(spyOnDispose).toHaveBeenCalled();
  });

  it('should call sort', () => {
    const handler = new ContactFocHandler(CONTACT_TAB_TYPE.ALL);
    SortUtils.compareLowerCaseString = jest.fn();
    handler.sortFunc(
      { id: 1, sortValue: 0, data: { id: 1, displayName: 'cbc' } },
      { id: 2, sortValue: 0, data: { id: 2, displayName: 'bca' } },
    );
    expect(SortUtils.compareLowerCaseString).toHaveBeenCalledWith('cbc', 'bca');
  });

  it('should call filter foc when type is all', () => {
    const handler = new ContactFocHandler(CONTACT_TAB_TYPE.ALL);
    personService.isVisiblePerson = jest.fn().mockImplementation(() => {
      return true;
    });
    expect(handler.filterFunc({ id: 1 } as Person)).toBe(true);
  });

  it('should call filter foc when type is personal', () => {
    const handler = new ContactFocHandler(CONTACT_TAB_TYPE.PERSONAL);
    personService.isVisiblePerson = jest.fn().mockImplementation(() => {
      return true;
    });
    expect(handler.filterFunc({ id: 1 } as Person)).toBe(true);
  });

  it('should call filter foc when type is glip contact', () => {
    const handler = new ContactFocHandler(CONTACT_TAB_TYPE.GLIP_CONTACT);
    personService.isVisiblePerson = jest.fn().mockImplementation(() => {
      return true;
    });
    expect(handler.filterFunc({ id: 1 } as Person)).toBe(true);
  });

  it('should call filter foc when type is cloud contact', () => {
    const handler = new ContactFocHandler(CONTACT_TAB_TYPE.CLOUD_CONTACT);
    personService.isVisiblePerson = jest.fn().mockImplementation(() => {
      return true;
    });
    expect(handler.filterFunc({ id: 1 } as Person)).toBe(true);
  });
});
