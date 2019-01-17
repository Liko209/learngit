/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-07 22:05:32
 * Copyright © RingCentral. All rights reserved.
 */

import { FileItemController } from '../FileItemController';
import { FileUploadController } from '../FileUploadController';
import { IItemService } from '../../../../service/IItemService';
import { daoManager, ItemDao } from '../../../../../../dao';
import { ControllerBuilder } from '../../../../../../framework/controller/impl/ControllerBuilder';
import { FileItem } from '../../entity/FileItem';
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
jest.mock('../../../../../../dao');
jest.mock('../FileUploadController');
jest.mock('../../../../../../framework/controller/impl/ControllerBuilder');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('FileItemController', () => {
  let fileItemController: FileItemController;
  let controllerBuilder: ControllerBuilder;
  const itemDao = new ItemDao(null);
  const itemService = {} as IItemService;
  function setup() {
    controllerBuilder = new ControllerBuilder<FileItem>();
    fileItemController = new FileItemController(
      itemService,
      controllerBuilder as ControllerBuilder<FileItem>,
    );
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

      controllerBuilder.buildRequestController = jest
        .fn()
        .mockReturnValue(fileRequestController);
      controllerBuilder.buildEntitySourceController = jest
        .fn()
        .mockReturnValue(entitySourceController);

      const uploadController = fileItemController.fileActionController;
      expect(uploadController).toBeInstanceOf(FileActionController);
      expect(controllerBuilder.buildRequestController).toBeCalledWith(
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
      controllerBuilder.buildRequestController = jest
        .fn()
        .mockReturnValue(fileRequestController);
      controllerBuilder.buildEntitySourceController = jest.fn();
      controllerBuilder.buildPartialModifyController = jest
        .fn()
        .mockReturnValue(partialModifyController);

      const uploadController = fileItemController.fileUploadController;
      expect(uploadController).toBeInstanceOf(FileUploadController);
      expect(controllerBuilder.buildRequestController).toBeCalledWith(
        expect.objectContaining({
          basePath: '/file',
        }),
      );
    });
  });
});
