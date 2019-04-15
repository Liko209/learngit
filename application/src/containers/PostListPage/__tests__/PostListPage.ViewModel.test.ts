/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-02-28 21:59:08
 * Copyright © RingCentral. All rights reserved.
 */
import * as utils from '@/store/utils';
import { PostListPageViewModel } from '../PostListPage.ViewModel';
import { POST_LIST_TYPE } from '../types';
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
      expect(ids).toStrictEqual([4, 5, 3, 1, 2, 7, 6]);
    });
  });
});
