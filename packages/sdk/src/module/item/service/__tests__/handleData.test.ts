/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-04 21:43:43
 * Copyright © RingCentral. All rights reserved.
 */

import ItemAPI from '../../../../api/glip/item';
import { daoManager } from '../../../../dao';
import { transform, baseHandleData } from '../../../../service/utils';
import buildItemDataHandler, { extractFileNameAndType } from '../handleData';
import { rawItemFactory } from '../../../../__tests__/factories';
import { ItemService } from '../ItemService';

jest.mock('../ItemService');
jest.mock('../../../../api/glip/item');
// const itemDao = daoManager.getDao(ItemDao);
jest.mock('../../../../dao', () => ({
  daoManager: {
    getDao: jest.fn(),
  },
}));
jest.mock('../../../../service/utils', () => ({
  baseHandleData: jest.fn(),
  transform: jest.fn(),
}));

ItemAPI.uploadFileItem = jest.fn();
ItemAPI.sendFileItem = jest.fn();

beforeEach(async () => {
  // itemDao.clear();
  ItemAPI.uploadFileItem.mockClear();
  ItemAPI.sendFileItem.mockClear();
});

describe('handleData()', () => {
  const itemService = new ItemService();
  itemService.handleSanitizedItems = jest.fn();

  it('should insert transformed data', async () => {
    const item = rawItemFactory.build({ _id: 1 });
    delete item.id;
    await buildItemDataHandler(itemService)([item]);
    expect(itemService.handleSanitizedItems).toHaveBeenCalled();
    expect(baseHandleData).toHaveBeenCalled();
    expect(transform).toHaveBeenCalledTimes(1);
    expect(daoManager.getDao).toHaveBeenCalled();
  });

  it('should insert nothing', async () => {
    const ret = await buildItemDataHandler(itemService)([]);
    expect(itemService.handleSanitizedItems).toHaveBeenCalled();
    expect(ret).toBeUndefined();
  });
});

describe('extractFileNameAndType()', () => {
  it('should extract the file name when full file path was given', () => {
    const result = extractFileNameAndType('fake/path/file.txt');
    expect(result).toEqual({ name: 'file.txt', type: 'txt' });
  });

  it('should extract the file name when short file name was given', () => {
    const result = extractFileNameAndType('file.txt');
    expect(result).toEqual({ name: 'file.txt', type: 'txt' });
  });

  it('should throw error when file path is empty', () => {
    expect(extractFileNameAndType('')).toEqual({
      name: '',
      type: '',
    });
  });
});
