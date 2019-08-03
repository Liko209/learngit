/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:25:48
 * Copyright © RingCentral. All rights reserved.
 */
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { jit } from 'shield/sdk';
import { PostService } from 'sdk/module/post';
import { Post } from './post/scenario';

jit('Send post test', context => {
  let postService: PostService;
  const { helper, sdk } = context;
  beforeAll(async () => {
    await sdk.setup();
    postService = ServiceLoader.getInstance(ServiceConfig.POST_SERVICE);
  });

  describe('received post', () => {
    it('received a post', async () => {
      const scenario = await helper.useScenario(Post.IncomingPost);
      await scenario.emitPost();
      const result = await postService.getPostsByGroupId({
        groupId: 16386,
      });
      expect(
        result.posts.find(item => item.text === 'hello'),
      ).not.toBeUndefined();
    });
  });
});
