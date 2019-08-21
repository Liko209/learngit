/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-07-15 15:22:58
 * Copyright © RingCentral. All rights reserved.
 */

import { EntitySourceController } from 'sdk/framework/controller/impl/EntitySourceController';
import { PartialModifyController } from 'sdk/framework/controller/impl/PartialModifyController';
import { PersonActionController } from '../PersonActionController';
import { AccountService } from 'sdk/module/account';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { RequestController } from 'sdk/framework/controller/impl/RequestController';
import { ItemService } from 'sdk/module/item';

jest.mock('sdk/framework/controller/impl/RequestController');
jest.mock('sdk/framework/controller/impl/EntitySourceController');
jest.mock('sdk/module/account');
jest.mock('sdk/module/item');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('PersonActionController', () => {
  let itemService: ItemService;
  let accountService: AccountService;
  let entitySourceController: EntitySourceController<any>;
  let partialModifyController: PartialModifyController<any>;
  let personActionController: PersonActionController;
  let requestController: RequestController<any>;
  const glipUserId = 100;
  const personData = { id: glipUserId, first_name: 's', last_name: 'k' };
  function setUp() {
    itemService = new ItemService();
    requestController = new RequestController(null as any);
    accountService = new AccountService(null as any);
    Object.defineProperty(accountService, 'userConfig', {
      get() {
        return {
          getGlipUserId: () => glipUserId,
        };
      },
    });
    entitySourceController = new EntitySourceController(
      null as any,
      null as any,
    );
    entitySourceController.getRequestController = jest
      .fn()
      .mockReturnValue(requestController);
    entitySourceController.getEntityNotificationKey = jest
      .fn()
      .mockReturnValue('person');
    partialModifyController = new PartialModifyController(
      entitySourceController,
    );
    entitySourceController.get = jest.fn().mockResolvedValue(personData);
    personActionController = new PersonActionController(
      partialModifyController,
      entitySourceController,
    );
    ServiceLoader.getInstance = jest.fn().mockImplementation((v: string) => {
      switch (v) {
        case ServiceConfig.ACCOUNT_SERVICE:
          return accountService;
        case ServiceConfig.ITEM_SERVICE:
          return itemService;
        default:
          return null;
      }
    });
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('setCustomStatus', () => {
    it('should set status correctly', async () => {
      partialModifyController.updatePartially = jest
        .fn()
        .mockImplementation(
          (params: {
            entityId: number;
            preHandlePartialEntity: any;
            doUpdateEntity: any;
          }) => {
            const data = params.preHandlePartialEntity({ id: params.entityId });
            params.doUpdateEntity(data);
          },
        );

      const mockId = 123;
      const mockStatus = 'in meeting';
      await personActionController.setCustomStatus(mockId, mockStatus);
      expect(partialModifyController.updatePartially).toHaveBeenCalled();
      expect(requestController.put).toHaveBeenCalledWith({
        id: mockId,
        away_status: mockStatus,
      });
    });
  });

  describe('editPersonalInfo', () => {
    it('should return when can not get current person', async () => {
      requestController.put = jest.fn();
      entitySourceController.get = jest.fn().mockResolvedValue(undefined);
      const result = await personActionController.editPersonalInfo({
        first_name: 'first',
      });
      expect(requestController.put).not.toHaveBeenCalled();
      expect(result).toEqual(null);
    });

    it('should return updated entity when update success', async () => {
      const partialData = { first_name: 'first' };
      const data = { ...personData, ...partialData };
      requestController.put = jest.fn().mockResolvedValue(data);
      const result = await personActionController.editPersonalInfo({
        first_name: 'first',
      });
      expect(result).toEqual(data);
      expect(requestController.put).toHaveBeenCalledWith(data);
    });

    it('should upload file to server then update person info when has new headshot', async () => {
      const offsetInfo = { offset: '100x100', crop: '9x1' };
      const uploadResponse = {
        _id: 123,
        creator_id: glipUserId,
        storage_url: 'url',
        version: 999,
      };
      itemService.uploadFileToServer = jest
        .fn()
        .mockResolvedValue(uploadResponse);
      const partialData = { first_name: 'first' };
      const data = {
        ...personData,
        ...partialData,
        headshot: {
          stored_file_id: uploadResponse._id,
          creator_id: uploadResponse.creator_id,
          url: uploadResponse.storage_url,
          ...offsetInfo,
        },
        headshot_version: uploadResponse.version,
      };
      requestController.put = jest.fn().mockResolvedValue(data);
      const result = await personActionController.editPersonalInfo(
        {
          first_name: 'first',
        },
        {
          offset: '100x100',
          crop: '9x1',
          file: {} as File,
        },
      );
      expect(result).toEqual(data);
      expect(requestController.put).toHaveBeenCalledWith(data);
    });
  });
});
