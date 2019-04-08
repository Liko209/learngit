/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-18 08:54:31
 * Copyright © RingCentral. All rights reserved.
 */
import PostAPI from '../post';
import Api from '../../api';

jest.mock('../../api');

describe('PostAPI', () => {
  describe('requestPosts()', () => {
    it('glipNetworkClient get() should be called with params', () => {
      PostAPI.requestPosts({ id: 111 });
      expect(PostAPI.glipNetworkClient.get).toHaveBeenCalledWith({
        path: '/posts',
        params: {
          id: 111,
        },
      });
    });
  });
  describe('sendPost()', () => {
    it('glipNetworkClient postData() should be called with params', () => {
      PostAPI.sendPost({ test: 'bbb' });
      expect(Api.postData).toHaveBeenCalledWith({ test: 'bbb' });
    });
  });
  describe('requestById()', () => {
    it('glipNetworkClient getDataById() should be called with params', () => {
      PostAPI.requestById(6);
      expect(Api.getDataById).toHaveBeenCalledWith(6);
    });
  });
  describe('editPost()', () => {
    it('glipNetworkClient putDataById() should be called with params', () => {
      PostAPI.editPost(6, { text: 'ccc' });
      expect(Api.putDataById).toHaveBeenCalledWith(6, { text: 'ccc' });
    });
  });
  describe('requestByIds()', () => {
    it('glipNetworkClient get() should be called with params', () => {
      PostAPI.requestByIds([11, 22, 33, 44]);
      expect(PostAPI.glipNetworkClient.get).toHaveBeenCalledWith({
        path: '/posts_items_by_ids',
        params: { post_ids: '11,22,33,44' },
      });
    });
  });
});
