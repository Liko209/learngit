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
import { baseHandleData } from '../../post/handleData';
import GroupService from '../../../service/group';

jest.mock('../../../service/state');
jest.mock('../../../service/post');
jest.mock('../../post/handleData');
jest.mock('../../../service/group');

const postService = new PostService();
const stateService = new StateService();
const groupService = new GroupService();
beforeEach(() => {
  PostService.getInstance = jest.fn().mockReturnValue(postService);
  StateService.getInstance = jest.fn().mockReturnValue(stateService);
  GroupService.getInstance = jest.fn().mockReturnValue(groupService);
});

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
    afterEach(() => {
      jest.clearAllMocks();
    });
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

    it('should return false if there is not group state', async () => {
      stateService.getById.mockResolvedValueOnce(null);
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
      expect(postService.getPostsFromRemote).toBeCalledTimes(0);
    });
    it('should not call baseHandleData if getPostsFromRemote has not data', async () => {
      const p = getProcessorInstance();
      p.needPreload.mockResolvedValueOnce({
        shouldPreload: true,
        unread_count: 10,
      });
      postService.getPostsFromRemote.mockResolvedValueOnce({
        posts: [],
        items: [],
        has_more: false,
      });
      await p.process();
      expect(baseHandleData).toBeCalledTimes(0);
    });
    it('should call baseHandleData if need preload post and requestPosts success', async () => {
      const p = getProcessorInstance();
      p.needPreload.mockResolvedValueOnce({
        shouldPreload: true,
        unread_count: 10,
      });
      postService.getPostsFromRemote.mockResolvedValueOnce({
        posts: [{ _id: 4 }],
        items: [],
        has_more: false,
      });
      await p.process();
      expect(baseHandleData).toBeCalledTimes(1);
    });
  });
});
