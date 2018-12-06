/* eslint-disable import/first */
/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-04-10 14:38:00
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../__tests__/types.d.ts" />

import ItemService from '../../../service/item';
import handleData, {
  uploadStorageFile,
  sendFileItem,
} from '../../../service/item/handleData';
import { daoManager } from '../../../dao';
import ItemAPI from '../../../api/glip/item';
import { postFactory } from '../../../__tests__/factories';
import { NetworkResultOk } from '../../../api/NetworkResult';
import { ItemFileUploadHandler } from '../itemFileUploadHandler';

jest.mock('../itemFileUploadHandler');

const itemService = new ItemService();
jest.mock('../handleData');
describe('ItemService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  describe('sendFile()', () => {
    it('send file should be null', async () => {
      uploadStorageFile.mockImplementation(() => [{ name: 'mock_file' }]);
      handleData.mockImplementation(() => [{ name: 'mock' }]);
      sendFileItem.mockImplementation(() => '');
      const result = await itemService.sendFile({
        file: new FormData(),
        groupId: '1',
      });
      expect(result).toBeNull();
    });
    it('send file should return result', async () => {
      uploadStorageFile.mockImplementation(() => [{ name: 'mock_file' }]);
      handleData.mockImplementation(() => [{ name: 'mock' }]);
      sendFileItem.mockImplementation(() => ({
        id: 1,
        name: 'xxx',
      }));
      const result = await itemService.sendFile({
        file: new FormData(),
        groupId: '1',
      });
      expect(result).toEqual({
        id: 1,
        name: 'xxx',
      });
    });

    it('send file should be error', async () => {
      uploadStorageFile.mockImplementation(() => {
        throw new Error('error');
      });
      try {
        await itemService.sendFile({
          file: new FormData(),
          groupId: '1',
        });
      } catch (e) {
        expect(e).toEqual(new Error('error'));
      }
    });
  });

  describe('getRightRailItemsOfGroup()', () => {
    const itemDao = {
      getItemsByGroupId: jest.fn(),
    };

    beforeAll(() => {
      handleData.mockClear();
      ItemAPI.requestRightRailItems = jest.fn().mockResolvedValue(
        new NetworkResultOk(
          {
            items: [],
          },
          200,
          {},
        ),
      );
      daoManager.getDao = jest.fn().mockReturnValue(itemDao);
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call related api', () => {
      itemService.getRightRailItemsOfGroup(123, 1);
      expect(ItemAPI.requestRightRailItems).toHaveBeenCalledWith(123);
      expect(itemDao.getItemsByGroupId).toHaveBeenCalledWith(123, 1);
      expect(handleData).not.toHaveBeenCalled();
    });

    it('should call handleData if api gets the data', (done: any) => {
      ItemAPI.requestRightRailItems.mockResolvedValue(
        new NetworkResultOk(
          {
            items: [{ _id: 1 }, { _id: 2 }],
          },
          200,
          {},
        ),
      );
      itemService.getRightRailItemsOfGroup(123);
      setTimeout(() => {
        expect(handleData).toHaveBeenCalled();
        done();
      });
    });

    it('should return dao query result', async () => {
      const mockLocalData = [{ id: 1 }, { id: 2 }, { id: 3 }];
      itemDao.getItemsByGroupId.mockResolvedValue(mockLocalData);
      await expect(itemService.getRightRailItemsOfGroup(123)).resolves.toBe(
        mockLocalData,
      );
    });
  });

  describe('getNoteById()', () => {
    const itemDao = {
      get: jest.fn(),
    };
    const rawData = {
      _id: 1,
      body: 'body',
      title: 'title',
    };
    const transformedData = {
      id: 1,
      body: 'body',
      title: 'title',
    };

    beforeAll(() => {
      handleData.mockClear();
      daoManager.getDao = jest.fn().mockReturnValue(itemDao);
      ItemAPI.getNote = jest
        .fn()
        .mockResolvedValue(new NetworkResultOk(rawData, 200, {}));
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should return local data if found', async () => {
      itemDao.get.mockResolvedValue(transformedData);
      const ret = await itemService.getNoteById(1);
      expect(ItemAPI.getNote).not.toHaveBeenCalled();
      expect(handleData).not.toHaveBeenCalled();
      expect(ret).toEqual(transformedData);
    });

    it('should call related api if local not found', async () => {
      itemDao.get.mockResolvedValue(null);
      const ret = await itemService.getNoteById(1);
      expect(ItemAPI.getNote).toHaveBeenCalled();
      expect(handleData).toHaveBeenCalled();
      expect(ret).toEqual(transformedData);
    });

    it('should return null if response data not exists', async () => {
      itemDao.get.mockResolvedValue(null);
      ItemAPI.getNote.mockResolvedValue(new NetworkResultOk(null, 200, {}));
      const ret = await itemService.getNoteById(1);
      expect(ret).toBeNull();
    });
  });
  describe('doNotRenderLink', () => {
    const rawData = {
      do_not_render: true,
    };
    const itemDao = {
      get: jest.fn(),
    };
    beforeAll(() => {
      daoManager.getDao = jest.fn().mockReturnValue(itemDao);
      ItemAPI.putItem = jest.fn().mockResolvedValue({
        data: rawData,
      });
      itemService.handlePartialUpdate = jest.fn().mockResolvedValue({
        id: 1,
        do_not_render: true,
        deactivated: false,
      });
    });
    afterAll(() => {
      jest.clearAllMocks();
    });
    const itemObj = {
      id: 1,
      do_not_render: false,
      deactivated: false,
    };
    it('should update do_not_render if doNotRenderLink called success', async () => {
      itemDao.get.mockReturnValue(itemObj);
      const ret = await itemService.doNotRenderItem(1, 'link');
      expect(await itemService.handlePartialUpdate).toHaveBeenCalled();
      expect(ret).toMatchObject({
        do_not_render: true,
        deactivated: false,
      });
    });
  });

  describe('getByPosts', () => {
    const itemDao = {
      getItemsByIds: jest.fn(),
    };
    beforeAll(() => {
      handleData.mockClear();
      daoManager.getDao = jest.fn().mockReturnValue(itemDao);
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call dao method with right id array', async () => {
      await itemService.getByPosts([
        postFactory.build({ item_ids: undefined }),
      ]);
      expect(itemDao.getItemsByIds).toHaveBeenCalledWith([]);
    });

    it('should call dao method with right id array', async () => {
      await itemService.getByPosts([
        postFactory.build({ item_ids: [1, 2, 3] }),
      ]);
      expect(itemDao.getItemsByIds).toHaveBeenCalledWith([1, 2, 3]);
    });

    it('should call dao method with right id array', async () => {
      await itemService.getByPosts([
        postFactory.build({ item_ids: [1, 2, 3], at_mention_item_ids: [5] }),
      ]);
      expect(itemDao.getItemsByIds).toHaveBeenCalledWith([1, 2, 3, 5]);
    });

    it('should call dao method with right id array', async () => {
      await itemService.getByPosts([
        postFactory.build({
          item_ids: [1, 2, 3],
          at_mention_item_ids: [1, 2, 5],
        }),
      ]);
      expect(itemDao.getItemsByIds).toHaveBeenCalledWith([1, 2, 3, 5]);
    });
  });

  describe('sendItemFile()', () => {
    it('send item file, invalid parameter', async () => {
      const itemFileUploadHandler = new ItemFileUploadHandler();
      jest
        .spyOn(itemService, '_getItemFileHandler')
        .mockReturnValue(itemFileUploadHandler);

      itemFileUploadHandler.sendItemFile.mockResolvedValue(null);
      const result = await itemService.sendItemFile(0, undefined, false);
      expect(result).toBe(null);
      expect(itemFileUploadHandler.sendItemFile).toBeCalledWith(
        0,
        undefined,
        false,
      );
    });
  });

  describe('cancelUpload()', () => {
    it('cancel upload with invalid paramter', async () => {
      const itemFileUploadHandler = new ItemFileUploadHandler();
      jest
        .spyOn(itemService, '_getItemFileHandler')
        .mockReturnValue(itemFileUploadHandler);
      itemFileUploadHandler.cancelUpload.mockResolvedValue(true);
      const result = await itemService.cancelUpload(0);
      expect(result).toBe(true);
    });
  });

  describe('getUploadItems()', () => {
    it('items are empty', async () => {
      const itemFileUploadHandler = new ItemFileUploadHandler();
      jest.spyOn(itemFileUploadHandler, 'getUploadItems').mockResolvedValue([]);
      jest
        .spyOn(itemService, '_getItemFileHandler')
        .mockReturnValue(itemFileUploadHandler);
      const result = await itemService.getUploadItems(1);
      expect(result.length).toBe(0);
    });
  });

  describe('isFileExists()', () => {
    const itemDao = {
      isFileItemExist: jest.fn(),
    };
    beforeAll(() => {
      handleData.mockClear();
      daoManager.getDao = jest.fn().mockReturnValue(itemDao);
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('check file exists with invalid groupId', async () => {
      const result = await itemService.isFileExists(0, 'test.jpg');
      expect(result).toBe(false);
      expect(itemDao.isFileItemExist).not.toHaveBeenCalled();
    });

    it('check file exists with invalid name', async () => {
      const result = await itemService.isFileExists(1, '');
      expect(result).toBe(false);
      expect(itemDao.isFileItemExist).not.toHaveBeenCalled();
    });

    it('check file exists', async () => {
      itemDao.isFileItemExist.mockReturnValue(true);
      const result = await itemService.isFileExists(1, 'test.jpg');
    });
  });

  describe('getUploadProgress()', () => {
    it('get progress invalid id', async () => {
      const result = await itemService.getUploadProgress(0);
      expect(result).toBeUndefined;
    });
  });
});
