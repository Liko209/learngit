/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-07 22:05:32
 * Copyright © RingCentral. All rights reserved.
 */

import { FileItemController } from '../FileItemController';
import { FileUploadController } from '../FileUploadController';
import { IItemService } from '../../../../service/IItemService';
import { daoManager } from '../../../../../../dao';
import { ItemDao } from '../../../../dao';
import {
  buildEntitySourceController,
  buildPartialModifyController,
  buildRequestController,
  buildEntityPersistentController,
} from '../../../../../../framework/controller';
import { Api } from '../../../../../../api';
import { PartialModifyController } from '../../../../../../framework/controller/impl/PartialModifyController';
import { RequestController } from '../../../../../../framework/controller/impl/RequestController';
import { EntitySourceController } from '../../../../../../framework/controller/impl/EntitySourceController';
import { FileActionController } from '../FileActionController';

jest.mock('../../../../../../framework/controller/impl/EntitySourceController');
jest.mock(
  '../../../../../../framework/controller/impl/PartialModifyController',
);
jest.mock('../../../../../../framework/controller/impl/RequestController');
jest.mock('../../../../../../api');
jest.mock('../../../../dao');
jest.mock('../FileUploadController');
jest.mock('../../../../../../framework/controller');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('FileItemController', () => {
  let fileItemController: FileItemController;
  const itemDao = new ItemDao(null);
  const itemService = {} as IItemService;
  function setup() {
    fileItemController = new FileItemController();

    Object.defineProperty(Api, 'glipNetworkClient', {
      get: jest.fn(() => {
        id: 1;
      }),
      configurable: true,
    });
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

  describe('isFileExists', () => {
    beforeEach(() => {
      clearMocks();
      setup();

      daoManager.getDao = jest.fn().mockReturnValue(itemDao);
      itemDao.getExistGroupFilesByName = jest.fn();
    });

    it('check file exists with invalid groupId', async () => {
      const result = await fileItemController.isFileExists(0, 'test.jpg');
      expect(result).toBe(false);
      expect(itemDao.getExistGroupFilesByName).not.toHaveBeenCalled();
    });

    it('check file exists with invalid name', async () => {
      const result = await fileItemController.isFileExists(1, '');
      expect(result).toBe(false);
      expect(itemDao.getExistGroupFilesByName).not.toHaveBeenCalled();
    });

    it('should return true when item has post_ids and length > 0', async () => {
      const itemFiles = [{ id: 1, name: 'test.jpg', post_ids: [12] }];
      itemDao.getExistGroupFilesByName.mockResolvedValueOnce(itemFiles);
      const result = await fileItemController.isFileExists(1, 'test.jpg');
      expect(itemDao.getExistGroupFilesByName).toBeCalledWith(
        1,
        'test.jpg',
        true,
      );
      expect(result).toBeTruthy();
    });

    it('should return false when the item has no post_ids', async () => {
      const itemFiles = [{ id: 1, name: 'test.jpg', post_ids: [] }];
      itemDao.getExistGroupFilesByName.mockResolvedValueOnce(itemFiles);
      const result = await fileItemController.isFileExists(1, 'test.jpg');
      expect(itemDao.getExistGroupFilesByName).toBeCalledWith(
        1,
        'test.jpg',
        true,
      );
      expect(result).toBeFalsy();
    });
  });

  describe('fileActionController', () => {
    it('should return FileActionController', () => {
      const fileRequestController = new RequestController(null);
      const entitySourceController = new EntitySourceController(
        null,
        null,
        null,
      );

      buildRequestController.mockImplementation(() => {
        return fileRequestController;
      });

      buildEntityPersistentController.mockReturnValue(undefined);

      buildEntitySourceController.mockImplementation(() => {
        return undefined;
      });

      const fileActionController = fileItemController.fileActionController;
      expect(fileActionController).toBeInstanceOf(FileActionController);
      expect(buildRequestController).toBeCalledWith(
        expect.objectContaining({
          basePath: '/file',
        }),
      );
    });
  });

  describe('fileUploadController', () => {
    it('should return fileUploadController', () => {
      const partialModifyController = new PartialModifyController(null);
      const fileRequestController = new RequestController(null);
      Object.defineProperty(Api, 'glipNetworkClient', {
        get: jest.fn(() => {
          id: 1;
        }),
      });

      buildRequestController.mockImplementation(() => {
        return fileRequestController;
      });

      buildEntitySourceController.mockImplementation(() => {
        return undefined;
      });

      buildPartialModifyController.mockImplementation(() => {
        return partialModifyController;
      });
      const uploadController = fileItemController.fileUploadController;
      expect(uploadController).toBeInstanceOf(FileUploadController);
    });
  });
});
