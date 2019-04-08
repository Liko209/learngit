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
jest.mock('sdk/module/post');
const postService = new PostService();

describe('PostListPage.ViewModel', () => {
  describe('idsProviders', () => {
    it('should provide ids list in correct order for mentions, show these posts in the order of recency in mentions page [JPT-392]', () => {
      const sourceArr = [4, 5, 3, 1, 2, 7, 6];
      jest.spyOn(utils, 'getSingleEntity').mockReturnValueOnce(sourceArr);
      const vm = new PostListPageViewModel();
      const ids = vm._dataMap[POST_LIST_TYPE.mentions].idListProvider();
      expect(ids).toStrictEqual([7, 6, 5, 4, 3, 2, 1]);
    });

    it('should provide ids list in correct order for bookmarks, show these posts by the time the items got bookmarked in bookmarks page [JPT-1226]', () => {
      const sourceArr = [4, 5, 3, 1, 2, 7, 6];
      jest.spyOn(utils, 'getSingleEntity').mockReturnValueOnce(sourceArr);
      const vm = new PostListPageViewModel();
      const ids = vm._dataMap[POST_LIST_TYPE.bookmarks].idListProvider();
      expect(ids).toStrictEqual([6, 7, 2, 1, 3, 5, 4]);
    });
  });
  describe('postFetcher()', () => {
    const sourceArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    jest.spyOn(utils, 'getSingleEntity').mockReturnValue(sourceArr);
    jest.spyOn(utils, 'getEntity').mockReturnValue({});
    const vm = new PostListPageViewModel();
    vm.onReceiveProps({
      type: POST_LIST_TYPE.mentions,
    });
    const data: number[] = [];
    const mockedStore = {
      _data: data,
      subtractedBy(ids: number[]) {
        return [_.difference(ids, this._data), _.intersection(ids, this._data)];
      },
    };
    beforeEach(() => {
      PostService.getInstance = jest.fn().mockReturnValue(postService);
      jest.spyOn(postService, 'getPostsByIds').mockResolvedValue({
        posts: [],
      });

      // vm.ids = ;
      jest
        .spyOn(storeManager, 'getEntityMapStore')
        .mockImplementationOnce(() => mockedStore);
      jest.spyOn(utils, 'getEntity').mockReturnValue({});
      data.splice(0, data.length);
    });
    afterEach(() => jest.clearAllMocks());
    it('should get all the posts from service', async () => {
      await vm.postFetcher(null, 4);
      expect(postService.getPostsByIds).toBeCalledWith([9, 8, 7, 6]);
      expect(utils.getEntity).toBeCalledTimes(0);
    });
  });
});
