/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:25:48
 * Copyright © RingCentral. All rights reserved.
 */
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { jit } from 'shield/sdk/SdkItFramework';
import { PostService } from 'sdk/module/post';
import { Post as PostScenario } from './scenario';
import { Post } from 'sdk/module/post/entity';

jit('Send post test', context => {
  let postService: PostService;
  const { helper, sdk, userContext, template } = context;
  beforeAll(async () => {
    await sdk.setup();
    postService = ServiceLoader.getInstance(ServiceConfig.POST_SERVICE);
  });

  describe('PostService', () => {
    it('send post success', async () => {
      const scenario = await helper.useScenario(PostScenario.Send.Success);
      const { post, team } = scenario;
      await postService.sendPost({
        text: post.text,
        groupId: team._id,
      });
      const result = await postService.getPostsByGroupId({
        groupId: team._id,
      });
      expect(result.posts.length).toEqual(1);
      expect(result.posts[0].id).toEqual(post.id);
      expect(result.posts[0].text).toEqual(post.text);
    });
    let sendFailedTeamId: number;
    let sendFailedPost: Post;
    it('send post 2: failed', async () => {
      const scenario = await helper.useScenario(PostScenario.Send.Fail);
      sendFailedTeamId = scenario.team._id;
      await expect(
        postService.sendPost({
          text: 'test post 2',
          groupId: sendFailedTeamId,
        }),
      ).rejects.not.toBeUndefined();
      const result = await postService.getPostsByGroupId({
        groupId: sendFailedTeamId,
      });
      sendFailedPost = result.posts[0];

      expect(result.posts.length).toEqual(1);
      expect(sendFailedPost.id < 0).toBeTruthy();
    });
    it('resend post successfully', async () => {
      await helper.useScenario(PostScenario.Send.Success, {
        targetTeam: {
          _id: sendFailedTeamId,
        },
        sendPost: {
          text: sendFailedPost.text,
        },
      });
      await postService.reSendPost(sendFailedPost.id);
      const groupPosts = await postService.getPostsByGroupId({
        groupId: sendFailedTeamId,
      });

      expect(groupPosts.posts.length).toEqual(1);
      expect(groupPosts.posts[0].text).toEqual(sendFailedPost.text);
      expect(groupPosts.posts[0].id > 0).toBeTruthy();
    });
  });
});
