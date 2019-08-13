/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-08-07 15:23:43
 * Copyright © RingCentral. All rights reserved.
 */

import { ZoomDeepLinkController } from '../ZoomDeepLinkController';
import ItemAPI from 'sdk/api/glip/item';
import { ItemService } from 'sdk/module/item';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { PersonService } from 'sdk/module/person';
import { MEETING_ACTION } from '../../../types';

jest.mock('sdk/module/item');
jest.mock('sdk/module/person');
jest.mock('sdk/api/glip/item');

describe('ZoomDeepLinkController', () => {
  let personService: PersonService;
  let itemService: ItemService;

  describe('startMeeting', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    function setUp() {
      personService = new PersonService();
      itemService = new ItemService();
      ServiceLoader.getInstance = jest
        .fn()
        .mockImplementation((config: string) => {
          if (config === ServiceConfig.PERSON_SERVICE) {
            return personService;
          }
          if (config === ServiceConfig.ITEM_SERVICE) {
            return itemService;
          }
        });
      itemService.handleIncomingData = jest.fn().mockResolvedValueOnce('');
      const controller = new ZoomDeepLinkController();
      return controller;
    }
    it('should return start link when flow success', async () => {
      const controller = setUp();
      personService.getCurrentPerson = jest.fn().mockResolvedValueOnce({
        getFirstName: jest.fn().mockResolvedValueOnce(''),
        getLastName: jest.fn().mockResolvedValueOnce(''),
      });
      ItemAPI.startZoomMeeting = jest.fn().mockReturnValueOnce({
        start_url: 'http://xxx',
      });
      const result = await controller.startMeeting([1]);
      expect(result.action).toEqual(MEETING_ACTION.DEEP_LINK);
    });
    it('should return error when has not user', async () => {
      const controller = setUp();
      personService.getCurrentPerson = jest.fn().mockResolvedValueOnce(null);
      ItemAPI.startZoomMeeting = jest.fn().mockReturnValueOnce({
        start_url: 'http://xxx',
      });
      const result = await controller.startMeeting([1]);
      expect(result.action).toEqual(MEETING_ACTION.ERROR);
    });
    it('should return error when request error', async () => {
      const controller = setUp();
      personService.getCurrentPerson = jest.fn().mockResolvedValueOnce({
        getFirstName: jest.fn().mockResolvedValueOnce(''),
        getLastName: jest.fn().mockResolvedValueOnce(''),
      });
      ItemAPI.startZoomMeeting = jest.fn().mockRejectedValueOnce('error');
      const result = await controller.startMeeting([1]);
      expect(result.action).toEqual(MEETING_ACTION.ERROR);
    });
    it('should return error when request success but has not start_url', async () => {
      const controller = setUp();
      personService.getCurrentPerson = jest.fn().mockResolvedValueOnce(null);
      ItemAPI.startZoomMeeting = jest.fn().mockReturnValueOnce({});
      const result = await controller.startMeeting([1]);
      expect(result.action).toEqual(MEETING_ACTION.ERROR);
    });
  });
});
