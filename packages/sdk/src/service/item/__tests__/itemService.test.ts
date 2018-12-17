/* eslint-disable import/first */
/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-04-10 14:38:00
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../__tests__/types.d.ts" />

import ItemService from '../../../service/item';
import { daoManager, ItemDao } from '../../../dao';
import ItemAPI from '../../../api/glip/item';
import { postFactory } from '../../../__tests__/factories';
import { ApiResultOk } from '../../../api/ApiResult';
import { ItemFileUploadHandler } from '../itemFileUploadHandler';
import handleData from '../../../service/item/handleData';

jest.mock('../itemFileUploadHandler');
jest.mock('../handleData');

const itemService = new ItemService();

describe('ItemService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('getRightRailItemsOfGroup()', () => {
    const itemDao = {
      getItemsByGroupId: jest.fn(),
    };

    beforeAll(() => {
      handleData.mockClear();
      ItemAPI.requestRightRailItems = jest.fn().mockResolvedValue(
        new ApiResultOk(
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
        new ApiResultOk(
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
        .mockResolvedValue(new ApiResultOk(rawData, 200, {}));
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
      ItemAPI.getNote.mockResolvedValue(new ApiResultOk(null, 200, {}));
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

    it('should call ItemDao to check whether file exist', async () => {
      const itemFiles = [{ id: 1, name: 'test.jpg' }];
      itemDao.isFileItemExist.mockResolvedValue(itemFiles);
      const result = await itemService.isFileExists(1, 'test.jpg');
      expect(itemDao.isFileItemExist).toBeCalledWith(1, 'test.jpg', true);
      expect(result).toBeTruthy;
    });
  });

  describe('getUploadProgress()', () => {
    it('get progress invalid id', async () => {
      const result = await itemService.getUploadProgress(0);
      expect(result).toBeUndefined;
    });
  });

  describe('ItemService should call functions in ItemFileUploadHandler', () => {
    const itemFileUploadHandler = new ItemFileUploadHandler();
    beforeEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
      jest
        .spyOn(itemService, '_getItemFileHandler')
        .mockReturnValue(itemFileUploadHandler);
    });

    describe('getItemsSendingStatus()', () => {
      it('should call getItemsSendStatus ', () => {
        const ids = [250052362250, -250052378634, 3];
        itemService.getItemsSendingStatus(ids);
        expect(itemFileUploadHandler.getItemsSendStatus).toBeCalledTimes(1);
      });
    });

    describe('resendFailedItems()', () => {
      it('should call resendFailedFile ', () => {
        const resendIds = [250052362250, 250052378634, 3];
        itemService.resendFailedItems(resendIds);
        expect(itemFileUploadHandler.resendFailedFile).toBeCalledTimes(2);
      });
    });

    describe('getUploadItems()', () => {
      it('items are empty', async () => {
        await itemService.getUploadItems(1);
        expect(itemFileUploadHandler.getUploadItems).toBeCalledWith(1);
      });
    });

    describe('cleanUploadingFiles()', () => {
      it('should call cleanUploadingFiles ', () => {
        const groupId = 1;
        itemService.cleanUploadingFiles(groupId);
        expect(itemFileUploadHandler.cleanUploadingFiles).toBeCalledTimes(1);
        expect(itemFileUploadHandler.cleanUploadingFiles).toBeCalledWith(
          groupId,
        );
      });
    });

    describe('sendItemFile()', () => {
      it('send item file, invalid parameter', async () => {
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
      it('should call cancel upload', async () => {
        itemFileUploadHandler.cancelUpload.mockResolvedValue(true);
        await itemService.cancelUpload(1);
        expect(itemFileUploadHandler.cancelUpload).toBeCalledTimes(1);
      });
    });
  });

  describe('getItemVersion()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it('should return 0 when can not find the item', async () => {
      jest.spyOn(itemService, 'getById').mockResolvedValueOnce(null);
      const res = await itemService.getItemVersion(1);
      expect(res).toBe(0);
    });

    it('should return version length when fine the item', async () => {
      jest
        .spyOn(itemService, 'getById')
        .mockResolvedValueOnce({ versions: [123, 123, 123] });
      const res = await itemService.getItemVersion(1);
      expect(res).toBe(3);
    });
  });
});
