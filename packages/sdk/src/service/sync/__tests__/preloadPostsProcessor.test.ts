/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-03 16:54:13
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../__tests__/types.d.ts" />
import PreloadPostsProcessor from '../preloadPostsProcessor';
import { Group } from '../../../models';
import PostService from '../../../service/post';
import StateService from '../../../service/state';
import PostAPI from '../../../api/glip/post';
import { baseHandleData } from '../../post/handleData';
import { ApiResultErr, ApiResultOk } from '../../../api/ApiResult';
import { BaseResponse } from 'foundation/src/network';
import { BaseError } from '../../../utils/error';

jest.mock('../../../service/post');
jest.mock('../../../api/glip/post');
jest.mock('../../../service/state');
jest.mock('../../post/handleData');

describe('PreloadPostsProcessor', () => {
  function getGroup({ most_recent_post_id = 0 } = {}) {
    const group: Group = {
      most_recent_post_id,
      members: [2],
      company_id: 1,
      set_abbreviation: '',
      email_friendly_abbreviation: '',
      most_recent_content_modified_at: 0,
      created_at: 1,
      modified_at: 1,
      creator_id: 1,
      is_new: false,
      deactivated: false,
      version: 1,
      id: 1,
    };
    return group;
  }

  const postService = new PostService();
  const stateService = new StateService();
  PostService.getInstance = jest.fn().mockReturnValue(postService);
  StateService.getInstance = jest.fn().mockReturnValue(stateService);

  describe('name', () => {
    it('should return "name1" when pass "name1" as name', () => {
      const processor = new PreloadPostsProcessor('name1', getGroup());
      expect(processor.name()).toBe('name1');
    });
  });

  describe('canContinue', () => {
    // for current solution, will always return true regards current processor is success or not
    it('should return true', () => {
      const processor = new PreloadPostsProcessor('3', getGroup());
      expect(processor.canContinue()).toBe(true);
    });
  });

  describe('needPreload', async () => {
    it('should return false if group has not most_recent_post_id', async () => {
      const processor = new PreloadPostsProcessor('3', getGroup());
      const result = await processor.needPreload();
      expect(result.shouldPreload).toBe(false);
    });
    it('should return false if has not unread_count', async () => {
      stateService.getById.mockResolvedValueOnce({
        unread_count: 0,
      });
      const processor = new PreloadPostsProcessor(
        '3',
        getGroup({ most_recent_post_id: 1 }),
      );
      const result = await processor.needPreload();
      expect(result.shouldPreload).toBe(false);
    });
    it('should return false if has not unread_count is over 100', async () => {
      stateService.getById.mockResolvedValueOnce({
        unread_count: 101,
      });
      const processor = new PreloadPostsProcessor(
        '3',
        getGroup({ most_recent_post_id: 1 }),
      );
      const result = await processor.needPreload();
      expect(result.shouldPreload).toBe(false);
    });

    it('should return false if oldest unread post is already in local and it is normal post', async () => {
      stateService.getById.mockResolvedValueOnce({
        unread_count: 99,
      });
      postService.getByIdFromDao.mockResolvedValueOnce({
        id: 4,
        creator_id: 3,
        group_id: 2,
      });
      const processor = new PreloadPostsProcessor(
        '3',
        getGroup({ most_recent_post_id: 4 }),
      );
      const result = await processor.needPreload();
      expect(result.shouldPreload).toBe(false);
    });
    it('should return true if oldest unread post is already in local but is deactivated', async () => {
      stateService.getById.mockResolvedValueOnce({
        unread_count: 99,
      });
      postService.getByIdFromDao.mockResolvedValueOnce({
        id: 4,
        creator_id: 3,
        group_id: 2,
        deactivated: true,
      });
      const processor = new PreloadPostsProcessor(
        '3',
        getGroup({ most_recent_post_id: 4 }),
      );
      const result = await processor.needPreload();
      expect(result.shouldPreload).toBe(true);
    });
    it('should return true if oldest unread post is not in local ', async () => {
      stateService.getById.mockResolvedValueOnce({
        unread_count: 99,
      });
      postService.getByIdFromDao.mockResolvedValueOnce(null);
      const processor = new PreloadPostsProcessor(
        '3',
        getGroup({ most_recent_post_id: 4 }),
      );
      const result = await processor.needPreload();
      expect(result.shouldPreload).toBe(true);
    });
  });

  describe('process', async () => {
    function getProcessorInstance() {
      const processor = new PreloadPostsProcessor(
        '3',
        getGroup({ most_recent_post_id: 4 }),
      );
      jest.spyOn(processor, 'needPreload');
      return processor;
    }
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should not call requestPosts if it does not need preload', async () => {
      const p = getProcessorInstance();
      p.needPreload.mockResolvedValueOnce({
        shouldPreload: false,
        unread_count: 0,
      });
      await p.process();
      expect(PostAPI.requestPosts).toBeCalledTimes(0);
    });
    it('should not call baseHandleData if requestPosts failed', async () => {
      const p = getProcessorInstance();
      p.needPreload.mockResolvedValueOnce({
        shouldPreload: true,
        unread_count: 10,
      });
      const error = new BaseError(404, 'Not Found');
      PostAPI.requestPosts.mockResolvedValueOnce(
        new ApiResultErr(error, {
          status: 500,
          headers: {},
        } as BaseResponse),
      );
      await p.process();
      expect(PostAPI.requestPosts).toBeCalledTimes(1);
      expect(baseHandleData).toBeCalledTimes(0);
    });
    it('should call baseHandleData if need preload post and requestPosts success', async () => {
      const p = getProcessorInstance();
      p.needPreload.mockResolvedValueOnce({
        shouldPreload: true,
        unread_count: 10,
      });
      PostAPI.requestPosts.mockResolvedValueOnce(
        new ApiResultOk({ posts: [], items: [] }, {
          status: 200,
          headers: {},
        } as BaseResponse),
      );
      await p.process();
      expect(PostAPI.requestPosts).toBeCalledTimes(1);
      expect(baseHandleData).toBeCalledTimes(1);
    });
  });
});
