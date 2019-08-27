/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-04-06 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

// import { observable, action } from 'mobx';

import { VIEWER_ITEM_TYPE } from '../constants';
import {
  ItemListDataSourceByPostProps,
  ItemListDataSourceByPost,
} from '../Viewer.DataSourceByPost';
import { getEntity } from '@/store/utils';
import { getFilterFunc } from '../utils';

import { ItemService } from 'sdk/module/item/service';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('@/store/utils');
jest.mock('sdk/module/item/module/file/utils');
jest.mock('../utils');
jest.mock('sdk/framework/service/EntityBaseService');

describe('Viewer.DataSource', () => {
  const props: ItemListDataSourceByPostProps = {
    groupId: 123,
    postId: 123,
    type: VIEWER_ITEM_TYPE.IMAGE_FILES,
  };
  beforeEach(() => {
    jest.resetAllMocks();
    const itemService = {
      getById: jest.fn(),
      batchGet: jest.fn(),
    };
    ServiceLoader.getInstance = jest.fn().mockReturnValue(itemService);
    (getEntity as jest.Mock).mockReturnValue({ itemIds: [] });
    (getFilterFunc as jest.Mock).mockImplementation(() => () => {
      return true;
    });
  });

  describe('_post()', () => {
    it('should return correct data when call _post ', async () => {
      const dataSource = new ItemListDataSourceByPost(props);
      const data = { itemIds: [1, 2, 3] };
      (getEntity as jest.Mock).mockReturnValue(data);
      const result = await dataSource['_post'];
      dataSource.dispose();
      expect(result).toEqual(data);
    });
  });
  describe('fetchData()', () => {
    it('should return correct data when call fetchData ', async () => {
      const dataSource = new ItemListDataSourceByPost(props);
      const data = [{ id: 1 }, { id: 2 }];
      ServiceLoader.getInstance<ItemService>('').batchGet.mockResolvedValue(
        data,
      );
      const result = await dataSource.fetchData();
      dataSource.dispose();
      expect(result.data).toEqual(data);
    });
  });
  describe('loadInitialData()', () => {
    it('should return correct data when call loadInitialData', async () => {
      const dataSource = new ItemListDataSourceByPost(props);
      const data = [{ id: 1 }, { id: 2 }];
      ServiceLoader.getInstance<ItemService>('').batchGet.mockResolvedValue(
        data,
      );

      const result = await dataSource.loadInitialData(1, 20);
      dataSource.dispose();
      expect(result).toEqual(data);
    });
  });
  describe('getIds()', () => {
    it('should return correct data when call getIds', () => {
      const dataSource = new ItemListDataSourceByPost(props);
      const data = [1, 2, 3];
      (getEntity as jest.Mock).mockReturnValue({ itemIds: data });
      const result = dataSource.getIds();
      expect(result).toEqual(data);
    });
  });
  describe('fetchIndexInfo()', () => {
    it('should return correct index and totalCount when call fetchIndexInfo', async () => {
      const dataSource = new ItemListDataSourceByPost(props);
      const data = [{ id: 1 }, { id: 2 }];
      ServiceLoader.getInstance<ItemService>('').batchGet.mockResolvedValue(
        data,
      );
      const result = await dataSource.fetchIndexInfo(2);
      dataSource.dispose();
      expect(result).toEqual({
        index: 1,
        totalCount: 2,
      });
    });
  });
});
