/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:25:48
 * Copyright © RingCentral. All rights reserved.
 */
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { jit } from 'shield/sdk/SdkItFramework';
import { PostService } from 'sdk/module/post';
import { Post } from './post/scenario';
import * as idUtils from 'shield/sdk/mocks/glip/utils';

jit('Send post test', context => {
  let postService: PostService;
  const { helper, sdk } = context;
  beforeAll(async () => {
    await sdk.setup();
    postService = ServiceLoader.getInstance(ServiceConfig.POST_SERVICE);
  });

  describe('received post', () => {
    it('received a post', async () => {
      const teamId = idUtils.genTeamId();
      const scenario = await helper.useScenario(Post.IncomingPost, {
        team: {
          _id: teamId,
          set_abbreviation: 'hahahahaha',
        },
        post: {
          group_id: teamId,
          text: 'no',
        },
      });
      await scenario.emitPost();
      const result = await postService.getPostsByGroupId({
        groupId: teamId,
      });
      expect(result.posts.find(item => item.text === 'no')).not.toBeUndefined();
    });
  });
});
