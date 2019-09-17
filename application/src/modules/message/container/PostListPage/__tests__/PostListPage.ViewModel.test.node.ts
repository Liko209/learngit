/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-02-28 21:59:08
 * Copyright © RingCentral. All rights reserved.
 */
import * as utils from '@/store/utils';
import { PostListPageViewModel } from '../PostListPage.ViewModel';
import { POST_LIST_TYPE } from '../types';
import storeManager from '@/store';
import * as _ from 'lodash';
import { PostService } from 'sdk/module/post';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { QUERY_DIRECTION } from 'sdk/dao';
import PostModel from '@/store/models/Post';
jest.mock('sdk/module/post');
const postService = new PostService();

describe('PostListPage.ViewModel', () => {
  describe('idsProviders', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should provide ids list in correct order for mentions, show these posts in the order of recency in mentions page [JPT-392]', () => {
      const sourceArr = [1, 2, 3, 4, 5, 6, 7];
      jest
        .spyOn(storeManager, 'getEntityMapStore')
        .mockImplementation(
          () => new Map([['atMentionPostIds', sourceArr], ['isMocked', false]]),
        );
      const vm = new PostListPageViewModel();
      const ids = vm._dataMap[POST_LIST_TYPE.mentions].idListProvider;
      expect(ids).toStrictEqual([7, 6, 5, 4, 3, 2, 1]);
    });

    it('should provide ids list in correct order for bookmarks, show these posts by the time the items got bookmarked in bookmarks page [JPT-1226]', () => {
      const sourceArr = [4, 5, 3, 1, 2, 7, 6];
      jest
        .spyOn(storeManager, 'getEntityMapStore')
        .mockImplementation(
          () => new Map([['favoritePostIds', sourceArr], ['isMocked', false]]),
        );
      const vm = new PostListPageViewModel();
      const ids = vm._dataMap[POST_LIST_TYPE.bookmarks].idListProvider;
      expect(ids).toStrictEqual([4, 5, 3, 1, 2, 7, 6]);
    });
  });
  describe('_getDataByIds()', () => {
    const data: number[] = [];
    const mockedStore = {
      _data: data,
      subtractedBy(ids: number[]) {
        return [_.difference(ids, this._data), _.intersection(ids, this._data)];
      },
    };
    beforeEach(() => {
      ServiceLoader.getInstance = jest.fn().mockReturnValue(postService);
      jest.spyOn(postService, 'getPostsByIds').mockResolvedValue({
        posts: [],
      });
      jest
        .spyOn(storeManager, 'getEntityMapStore')
        .mockImplementationOnce(() => mockedStore);
      mockedStore._data.splice(0, data.length);
      jest.spyOn(utils, 'getEntity').mockImplementation((ENTITY_NAME, id) => {
        return {
          0: new PostModel ({
            id: 0,
            deactivated: true,
          } as any),
          1: new PostModel({
            id: 1,
            deactivated: false,
          } as any),
          2: new PostModel({
            id: 2,
            deactivated: true,
          } as any),
        }[id];
      });
    });
    afterEach(() => jest.clearAllMocks());
    it('should return data of posts which are not deactivated when being called', async () => {
      mockedStore._data = [0, 1, 2];
      const ids = [0, 1, 2];

      const vm = new PostListPageViewModel();
      const result = await vm._getDataByIds(ids);
      expect(postService.getPostsByIds).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
    it('should call postService.getPostsByIds when there are idsOutOfStore', async () => {
      mockedStore._data = [0, 1, 2];
      const ids = [3, 4, 5];
      const vm = new PostListPageViewModel();
      await vm._getDataByIds(ids);
      expect(postService.getPostsByIds).toHaveBeenCalled();
    });
  });
  describe('_getOnePageData()', () => {
    afterEach(() => jest.clearAllMocks());
    it('should return { data: [], hasMore: true } when this.ids is undefined', async () => {
      const vm = new PostListPageViewModel();
      vm._type = undefined;
      const result = await vm._getOnePageData(0, 20);
      expect(result).toEqual({ data: [], hasMore: true });
    });
    it.each`
      ids  | filteredData | pageSize | data | hasMore
      ${4} | ${3}         | ${2}     | ${2} | ${true}
      ${3} | ${3}         | ${2}     | ${2} | ${true}
      ${4} | ${3}         | ${3}     | ${3} | ${true}
      ${3} | ${3}         | ${3}     | ${3} | ${false}
      ${3} | ${2}         | ${2}     | ${2} | ${true}
      ${2} | ${2}         | ${2}     | ${2} | ${false}
      ${3} | ${2}         | ${3}     | ${2} | ${false}
      ${2} | ${2}         | ${3}     | ${2} | ${false}
    `(
      'should return { data: array of length $data, hasMore: $hasMore } - _getOnePageData(0, $pageSize) when length of ids is $ids and length of filteredData is $filteredData',
      async ({ ids, filteredData, pageSize, data, hasMore }) => {
        const vm = new PostListPageViewModel();
        filteredData = new Array(filteredData);
        jest.spyOn(vm, '_getDataByIds').mockImplementation((ids: number[]) => {
          return filteredData.splice(0, ids.length);
        });
        vm._type = 'bookmarks';
        jest
          .spyOn(storeManager, 'getEntityMapStore')
          .mockImplementation(
            () =>
              new Map([
                ['favoritePostIds', new Array(ids)],
                ['isMocked', false],
              ]),
          );
        const result = await vm._getOnePageData(0, pageSize);
        expect(result).toEqual({ data: new Array(data), hasMore });
      },
    );
  });
  describe('postFetcher()', () => {
    afterEach(() => jest.clearAllMocks());
    it('should call _getOnePageData(0, 20) when being called without anchor', async () => {
      const vm = new PostListPageViewModel();
      jest
        .spyOn(vm, '_getOnePageData')
        .mockImplementation(() => Promise.resolve());
      await vm.postFetcher(QUERY_DIRECTION.BOTH, 20);
      expect(vm._getOnePageData).toBeCalledWith(0, 20);
    });
    it('should call _getOnePageData(5, 20) when being called with anchor', async () => {
      const vm = new PostListPageViewModel();
      jest
        .spyOn(vm, '_getOnePageData')
        .mockImplementation(() => Promise.resolve());
      vm._type = 'bookmarks';
      jest
        .spyOn(storeManager, 'getEntityMapStore')
        .mockImplementation(
          () =>
            new Map([
              ['favoritePostIds', [0, 1, 2, 3, 4, 5, 6]],
              ['isMocked', false],
            ]),
        );
      await vm.postFetcher(QUERY_DIRECTION.BOTH, 20, { id: 4 });
      expect(vm._getOnePageData).toBeCalledWith(5, 20);
    });
  });
});
