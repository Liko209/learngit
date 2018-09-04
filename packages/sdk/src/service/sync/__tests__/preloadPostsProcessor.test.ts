/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-03 16:54:13
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../__tests__/types.d.ts" />
import PreloadPostsProcessor from '../preloadPostsProcessor';
import { Group } from '../../../models';
import PostService from '../../../service/post';
import PostAPI from '../../../api/glip/post';

jest.mock('../../../service/post');
PostAPI.requestPosts = jest.fn();

describe('PreloadPostsProcessor', () => {
  const group: Group = {
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
  const postService = new PostService();
  PostService.getInstance = jest.fn().mockReturnValue(postService);

  it('name', () => {
    const processor = new PreloadPostsProcessor('1', group);
    expect(processor.name()).toBe('1');
  });

  it('canContinue', () => {
    const processor = new PreloadPostsProcessor('1', group);
    expect(processor.canContinue()).toBe(true);
  });

  it('process, does not need preload because not already has post in local', async () => {
    group.most_recent_post_id = 123;
    postService.groupHasPostInLocal.mockResolvedValueOnce(true);
    const processor = new PreloadPostsProcessor('2', group);
    const yes = await processor.process();
    expect(yes).toBe(true);
  });

  it('process, need preload because there is not post in local', async () => {
    postService.groupHasPostInLocal.mockResolvedValueOnce(false);
    PostAPI.requestPosts.mockResolvedValueOnce({ data: { posts: [], items: [] } });
    const processor = new PreloadPostsProcessor('3', group);
    const yes = await processor.process();
    expect(yes).toBe(true);
  });

  it('process, preload but with  > 400 error', async () => {
    postService.groupHasPostInLocal.mockResolvedValueOnce(false);
    PostAPI.requestPosts.mockResolvedValueOnce({ status: 403 });
    const processor = new PreloadPostsProcessor('3', group);
    const yes = await processor.process();
    expect(yes).toBe(false);
    expect(processor.canContinue()).toBe(false);
  });
});
