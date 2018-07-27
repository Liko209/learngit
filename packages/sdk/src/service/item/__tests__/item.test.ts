/* eslint-disable import/first */
/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-04-10 14:38:00
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../__tests__/types.d.ts" />

import ItemService from '../../../service/item';
import handleData, { uploadStorageFile, sendFileItem } from '../../../service/item/handleData';
import { daoManager } from '../../../dao';
import ItemAPI from '../../../api/glip/item';

const itemService = new ItemService();

jest.mock('../handleData');

describe('ItemService', () => {
  describe('sendFile()', () => {
    it('send file should be null', async () => {
      uploadStorageFile.mockImplementation(() => [{ name: 'mock_file' }]);
      handleData.mockImplementation(() => [{ name: 'mock' }]);
      sendFileItem.mockImplementation(() => '');
      const result = await itemService.sendFile({
        file: new FormData(),
        groupId: '1'
      });
      expect(result).toBeNull();
    });
    it('send file should return result', async () => {
      uploadStorageFile.mockImplementation(() => [{ name: 'mock_file' }]);
      handleData.mockImplementation(() => [{ name: 'mock' }]);
      sendFileItem.mockImplementation(() => ({
        id: 1,
        name: 'xxx'
      }));
      const result = await itemService.sendFile({
        file: new FormData(),
        groupId: '1'
      });
      expect(result).toEqual({
        id: 1,
        name: 'xxx'
      });
    });

    it('send file should be error', async () => {
      uploadStorageFile.mockImplementation(() => {
        throw new Error('error');
      });
      try {
        await itemService.sendFile({
          file: new FormData(),
          groupId: '1'
        });
      } catch (e) {
        expect(e).toEqual(new Error('error'));
      }
    });
  });

  describe('getRightRailItemsOfGroup()', () => {
    const itemDao = {
      getItemsByGroupId: jest.fn()
    };
    beforeAll(() => {
      handleData.mockClear();
      ItemAPI.requestRightRailItems = jest.fn().mockResolvedValue({
        data: {
          items: []
        }
      });
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
    it('should call handleData if api gets the data', done => {
      ItemAPI.requestRightRailItems.mockResolvedValue({
        data: {
          items: [{ _id: 1 }, { _id: 2 }]
        }
      });
      itemService.getRightRailItemsOfGroup(123);
      setTimeout(() => {
        expect(handleData).toHaveBeenCalled();
        done();
      });
    });
    it('should return dao query result', async () => {
      const mockLocalData = [{ id: 1 }, { id: 2 }, { id: 3 }];
      itemDao.getItemsByGroupId.mockResolvedValue(mockLocalData);
      await expect(itemService.getRightRailItemsOfGroup(123)).resolves.toBe(mockLocalData);
    });
  });

  describe('getNoteById()', () => {
    const itemDao = {
      get: jest.fn()
    };
    const rawData = {
      _id: 1,
      body: 'body',
      title: 'title'
    };
    const transformedData = {
      id: 1,
      body: 'body',
      title: 'title'
    };
    beforeAll(() => {
      handleData.mockClear();
      daoManager.getDao = jest.fn().mockReturnValue(itemDao);
      ItemAPI.getNote = jest.fn().mockResolvedValue({
        data: rawData
      });
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
      ItemAPI.getNote.mockResolvedValue({});
      const ret = await itemService.getNoteById(1);
      expect(ret).toBeNull();
    });
  });
});
