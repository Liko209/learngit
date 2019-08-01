/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:25:48
 * Copyright © RingCentral. All rights reserved.
 */
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { itForSdk } from 'shield/sdk';
import { PostService } from 'sdk/module/post';
import { sendPost } from './scenario/sendPost.scenario';
import { wait } from 'shield/utils';
import { Post } from 'sdk/module/post/entity';

itForSdk('Send post test', context => {
  let postService: PostService;
  const { helper, sdk, userContext, template } = context;
  beforeAll(async () => {
    await sdk.setup();
    postService = ServiceLoader.getInstance(ServiceConfig.POST_SERVICE);
  });

  describe('PostService', () => {
    it('send post success', async () => {
      // PostScenario.action.send.success,

      const sendPostScenario = await helper.useScenario(sendPost.success);
      const { post, team } = sendPostScenario;
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
      const sendPostFailScenario = await helper.useScenario(sendPost.fail);
      sendFailedTeamId = sendPostFailScenario.team._id;
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
    it('received a post', async () => {
      await helper.socketServer.emitPacket(
        require('./data/RECEIVE_POST.SOCKET.json'),
      );
      await wait();
      const result = await postService.getPostsByGroupId({
        groupId: 16386,
      });
      expect(
        result.posts.find(item => item.text === 'hello'),
      ).not.toBeUndefined();
    });
    it('resend post successfully', async () => {
      await helper.useScenario(sendPost.success, {
        teamId: sendFailedTeamId,
        postText: sendFailedPost.text,
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
