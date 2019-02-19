/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-03 16:54:13
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../__tests__/types.d.ts" />
import { Group } from '../../../module/group/entity/Group';
import { PostService } from '../../../module/post/service/PostService';
import PreloadPostsProcessor from '../preloadPostsProcessor';
import { StateService } from '../../../module/state';
import { GroupService } from '../../../module/group';

jest.mock('../../../module/post/service/PostService');
jest.mock('../../../service/profile');
jest.mock('../../../module/state');
jest.mock('../../../module/group');

const postService: PostService = new PostService();
const stateService: StateService = new StateService();
const groupService: GroupService = new GroupService();
beforeEach(() => {
  PostService.getInstance = jest.fn().mockReturnValue(postService);
  StateService.getInstance = jest.fn().mockReturnValue(stateService);
  GroupService.getInstance = jest.fn().mockReturnValue(groupService);
});

const ONE_PAGE = 20;

describe('PreloadPostsProcessor', () => {
  function getGroup({ most_recent_post_id = 0, is_team = false } = {}) {
    const group: Group = {
      is_team,
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
      const processor = new PreloadPostsProcessor('name1', getGroup(), false);
      expect(processor.name()).toBe('name1');
    });
  });

  describe('canContinue', () => {
    // for current solution, will always return true regards current processor is success or not
    it('should return true', () => {
      const processor = new PreloadPostsProcessor('3', getGroup(), false);
      expect(processor.canContinue()).toBe(true);
    });
  });

  describe('process', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });
    it('should call postService.getPostsByGroupId if need preload', async () => {
      const processor = new PreloadPostsProcessor('name1', getGroup(), false);
      jest.spyOn(processor, 'needPreload').mockResolvedValueOnce({
        shouldPreload: true,
        limit: ONE_PAGE,
      });
      postService.getRemotePostsByGroupId.mockResolvedValueOnce(null);
      await processor.process();
      expect(postService.getRemotePostsByGroupId).toHaveBeenCalledTimes(
        1,
      );
    });
    it('should not call postService.getPostsByGroupId if need preload', async () => {
      const processor = new PreloadPostsProcessor('name1', getGroup(), false);
      jest.spyOn(processor, 'needPreload').mockResolvedValueOnce({
        shouldPreload: false,
        limit: 0,
      });
      postService.getRemotePostsByGroupId.mockResolvedValueOnce(null);
      await processor.process();
      expect(postService.getRemotePostsByGroupId).toHaveBeenCalledTimes(
        0,
      );
    });
  });

  describe('needPreload', () => {
    // favorite and groups have the same behavior
    describe('favorite/groups cases', () => {
      afterEach(() => {
        jest.resetAllMocks();
      });
      function setUpMock({
        state = null,
        postCount = 0,
        hasMore = false,
      } = {}) {
        stateService.getById.mockResolvedValueOnce(state);
        postService.getPostCountByGroupId.mockResolvedValueOnce(postCount);
        groupService.hasMorePostInRemote.mockResolvedValueOnce(hasMore);
      }
      it('should not preload when local post has more than one page', async () => {
        setUpMock({
          state: null,
          postCount: 21,
        });

        const processor = new PreloadPostsProcessor('name1', getGroup(), false);
        const result = await processor.needPreload();
        expect(result.shouldPreload).toBeFalsy();
      });
      it('should not preload when local post < ONE_PAGE but has no more remote post', async () => {
        setUpMock({
          state: null,
          postCount: 10,
          hasMore: false,
        });
        const processor = new PreloadPostsProcessor('name1', getGroup(), false);
        const result = await processor.needPreload();
        expect(result.shouldPreload).toBeFalsy();
      });

      it('should preload all unread when unread count > ONE_PAGE', async () => {
        setUpMock({
          state: {
            unread_count: 21,
          },
          postCount: 0,
          hasMore: true,
        });

        const processor = new PreloadPostsProcessor('name1', getGroup(), false);
        const result = await processor.needPreload();
        expect(result.shouldPreload).toBeTruthy();
        expect(result.limit).toEqual(21);
      });
      it('should preload ONE_PAGE when unread count < ONE_PAGE / should preload when local post < ONE_PAGE and has more remote post', async () => {
        setUpMock({
          state: {
            unread_count: 19,
          },
          postCount: 0,
          hasMore: true,
        });

        const processor = new PreloadPostsProcessor('name1', getGroup(), false);
        const result = await processor.needPreload();
        expect(result.shouldPreload).toBeTruthy();
        expect(result.limit).toEqual(ONE_PAGE);
      });
      it('should preload team if it is in favorites even but has not at mention', async () => {
        setUpMock({
          state: {
            unread_count: 19,
          },
          postCount: 0,
          hasMore: true,
        });

        const processor = new PreloadPostsProcessor(
          'name1',
          getGroup({ is_team: true }),
          true,
        );
        const result = await processor.needPreload();
        expect(result.shouldPreload).toBeTruthy();
        expect(result.limit).toEqual(ONE_PAGE);
      });
    });
    describe('teams which are not in favorite', () => {
      afterEach(() => {
        jest.clearAllMocks();
      });
      it('should not preload when has not state', async () => {
        const processor = new PreloadPostsProcessor(
          'name1',
          getGroup({ is_team: true }),
          false,
        );
        stateService.getById.mockResolvedValueOnce(null);
        const result = await processor.needPreload();
        expect(result.shouldPreload).toBeFalsy();
        expect(result.limit).toEqual(0);
      });
      it('should not preload when has not unread_mentions_count', async () => {
        const processor = new PreloadPostsProcessor(
          'name1',
          getGroup({ is_team: true }),
          false,
        );
        stateService.getById.mockResolvedValueOnce({
          unread_count: 99,
        });
        const result = await processor.needPreload();
        expect(result.shouldPreload).toBeFalsy();
        expect(result.limit).toEqual(0);
      });
      it('should not preload when unread post has in local', async () => {
        const processor = new PreloadPostsProcessor(
          'name1',
          getGroup({ is_team: true }),
          false,
        );
        stateService.getById.mockResolvedValueOnce({
          unread_count: 99,
          unread_mentions_count: 1,
        });
        postService.getPostFromLocal.mockResolvedValueOnce({});
        const result = await processor.needPreload();
        expect(result.shouldPreload).toBeFalsy();
        expect(result.limit).toEqual(0);
      });

      it('should preload all unread when unread count > ONE_PAGE', async () => {
        const processor = new PreloadPostsProcessor(
          'name1',
          getGroup({ is_team: true }),
          false,
        );
        stateService.getById.mockResolvedValueOnce({
          unread_count: 99,
          unread_mentions_count: 1,
        });
        groupService.hasMorePostInRemote.mockResolvedValueOnce(true);
        postService.getPostFromLocal.mockResolvedValueOnce(null);
        const result = await processor.needPreload();
        expect(result.shouldPreload).toBeTruthy();
        expect(result.limit).toEqual(99);
      });

      it('should preload one page when unread count < ONE_PAGE', async () => {
        const processor = new PreloadPostsProcessor(
          'name1',
          getGroup({ is_team: true }),
          false,
        );
        stateService.getById.mockResolvedValueOnce({
          unread_count: 10,
          unread_mentions_count: 1,
        });
        groupService.hasMorePostInRemote.mockResolvedValueOnce(true);
        postService.getPostFromLocal.mockResolvedValueOnce(null);
        const result = await processor.needPreload();
        expect(result.shouldPreload).toBeTruthy();
        expect(result.limit).toEqual(ONE_PAGE);
      });
      it('should not preload when has not more post in remote', async () => {
        const processor = new PreloadPostsProcessor(
          'name1',
          getGroup({ is_team: true }),
          false,
        );
        stateService.getById.mockResolvedValueOnce({
          unread_count: 10,
          unread_mentions_count: 1,
        });
        groupService.hasMorePostInRemote.mockResolvedValueOnce(false);
        postService.getPostFromLocal.mockResolvedValueOnce(null);
        const result = await processor.needPreload();
        expect(result.shouldPreload).toBeFalsy();
      });
    });
  });
});
