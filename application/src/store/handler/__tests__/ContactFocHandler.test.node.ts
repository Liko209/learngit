/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-08-22 18:12:34
 * Copyright © RingCentral. All rights reserved.
 */

import { ContactFocHandler, CONTACT_TAB_TYPE } from '../ContactFocHandler';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { Person } from 'sdk/module/person/entity';
import { SortUtils } from 'sdk/framework/utils';
import { SearchUtils } from 'sdk/framework/utils/SearchUtils';

describe('ContactFocHandler', () => {
  const personService = {
    getEntities: jest.fn(),
    getFullName: jest.fn(),
    isVisiblePerson: jest.fn(),
    getEntitySource: jest.fn(),
    getPhoneNumbers: jest.fn(),
  };

  const searchService = {
    generateMatchedInfo: jest.fn(),
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
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((serviceName: string) => {
        if (serviceName === ServiceConfig.PERSON_SERVICE) {
          return personService;
        }

        if (serviceName === ServiceConfig.SEARCH_SERVICE) {
          return searchService;
        }
      });
  }

  beforeEach(() => {
    clearMocks();

    setUp();
  });

  it('should call create/dispose foc', async () => {
    const handler = new ContactFocHandler();
    personService.getEntitySource.mockReturnValue(entitySourceController);
    const foc = await handler.getFoc();
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

  describe('foc filter', () => {
    it('should call filter foc when type is all with name matched', () => {
      const handler = new ContactFocHandler(CONTACT_TAB_TYPE.ALL, 'test');
      personService.isVisiblePerson = jest.fn().mockImplementation(() => {
        return true;
      });

      personService.getFullName = jest.fn().mockReturnValue('Test displayName');
      personService.getPhoneNumbers = jest.fn().mockReturnValue([]);

      const matchedInfo = {
        nameMatched: true,
        phoneNumberMatched: false,
        isMatched: true,
        matchedNumbers: [],
      };
      searchService.generateMatchedInfo = jest
        .fn()
        .mockReturnValue(matchedInfo);

      expect(
        handler.filterFunc({
          id: 1,
          display_name: 'Test displayName',
        } as Person),
      ).toBe(true);
    });

    it('should call filter foc when type is all with no matched', async () => {
      const handler = new ContactFocHandler(CONTACT_TAB_TYPE.ALL, 'test');

      SearchUtils.isFuzzyMatched = jest.fn().mockReturnValue(false);

      personService.isVisiblePerson = jest.fn().mockImplementation(() => {
        return true;
      });
      personService.getPhoneNumbers = jest.fn().mockReturnValue([]);

      personService.getFullName = jest.fn().mockReturnValue('displayName');

      const matchedInfo = {
        nameMatched: false,
        phoneNumberMatched: false,
        isMatched: false,
        matchedNumbers: [],
      };
      searchService.generateMatchedInfo = jest
        .fn()
        .mockReturnValue(matchedInfo);

      expect(
        handler.filterFunc({
          id: 1,
          display_name: 'displayName',
          email: 'email@ringcentral.com',
        } as Person),
      ).toBe(false);
    });

    it('should call filter foc when type is all with email matched', () => {
      const handler = new ContactFocHandler(CONTACT_TAB_TYPE.ALL, 'email');
      personService.isVisiblePerson = jest.fn().mockImplementation(() => {
        return true;
      });
      personService.getPhoneNumbers = jest.fn().mockReturnValue([]);

      SearchUtils.isFuzzyMatched = jest.fn().mockReturnValue(true);

      personService.getFullName = jest.fn().mockReturnValue('Test displayName');

      const matchedInfo = {
        nameMatched: false,
        phoneNumberMatched: false,
        isMatched: false,
        matchedNumbers: [],
      };
      searchService.generateMatchedInfo = jest
        .fn()
        .mockReturnValue(matchedInfo);

      expect(
        handler.filterFunc({
          id: 1,
          display_name: 'Test displayName',
          email: 'email@ringcentral.com',
        } as Person),
      ).toBe(true);
    });

    it('should call filter foc when type is personal', () => {
      const handler = new ContactFocHandler(CONTACT_TAB_TYPE.PERSONAL);
      personService.isVisiblePerson = jest.fn().mockImplementation(() => {
        return true;
      });
      personService.getPhoneNumbers = jest.fn().mockReturnValue([]);
      expect(handler.filterFunc({ id: 1 } as Person)).toBe(true);
    });

    it('should call filter foc when type is glip contact', () => {
      const handler = new ContactFocHandler(CONTACT_TAB_TYPE.GLIP_CONTACT);
      personService.isVisiblePerson = jest.fn().mockImplementation(() => {
        return true;
      });
      personService.getPhoneNumbers = jest.fn().mockReturnValue([]);
      expect(handler.filterFunc({ id: 1 } as Person)).toBe(true);
    });

    it('should call filter foc when type is cloud contact', () => {
      const handler = new ContactFocHandler(CONTACT_TAB_TYPE.CLOUD_CONTACT);
      personService.isVisiblePerson = jest.fn().mockImplementation(() => {
        return true;
      });
      personService.getPhoneNumbers = jest.fn().mockReturnValue([]);
      expect(handler.filterFunc({ id: 1 } as Person)).toBe(true);
    });

    it('should filter when phone number is matched', () => {
      const handler = new ContactFocHandler(CONTACT_TAB_TYPE.ALL, '555');
      personService.isVisiblePerson = jest.fn().mockImplementation(() => {
        return true;
      });
      const phoneNumbers = [{ id: '1555555' }, { id: '166666555' }];
      personService.getPhoneNumbers = jest.fn().mockReturnValue(phoneNumbers);

      SearchUtils.isFuzzyMatched = jest.fn().mockReturnValue(true);

      personService.getFullName = jest.fn().mockReturnValue('Test displayName');

      const matchedInfo = {
        nameMatched: false,
        phoneNumberMatched: false,
        isMatched: false,
        matchedNumbers: phoneNumbers,
      };
      searchService.generateMatchedInfo = jest
        .fn()
        .mockReturnValue(matchedInfo);

      expect(
        handler.filterFunc({
          id: 1,
          display_name: 'Test displayName',
          email: 'email@ringcentral.com',
        } as Person),
      ).toBe(true);
    });
  });
});
