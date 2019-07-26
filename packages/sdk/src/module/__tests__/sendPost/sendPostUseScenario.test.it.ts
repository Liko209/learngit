/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:25:48
 * Copyright © RingCentral. All rights reserved.
 */
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { itForSdk, readJson } from 'shield/sdk';
import { PostService } from 'sdk/module/post';
import {
  sendPostSuccess,
  sendPostFail,
  resendPost,
} from './data/sendPost.scenario';
// import { sendPostFailScenarioFactory } from './data/sendPostFail.scenario';
import { wait } from 'shield/utils';
import { IGlipPostPost } from 'shield/sdk/mocks/server/glip/api/post/post.post.contract';
import { createResponse } from 'shield/sdk/mocks/server/utils';
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

      const sendPostScenario = await helper.useScenario(sendPostSuccess);
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
    let sendFailedPost: Post;
    let sendFailedTeamId: number;
    it('send post 2: failed', async () => {
      const sendPostFailScenario = await helper.useScenario(sendPostFail);
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
      const resendPostScenario = await helper.useScenario(resendPost);
      // helper.mockResponse(
      // readJson<IGlipPostPost>(require('./data/SEND_POST.SUCCESS.json')),
      // data => {
      // data.response.data.group_id = sendFailedTeamId;
      // data.response.data.text = 'test post 2';
      // data.response.data._id = helper
      // .glipDataHelper()
      // .post.factory.build()._id;
      // },
      // (request, requestResponse) => {
      // return createResponse({
      // ...requestResponse.response,
      // data: {
      // ...requestResponse.response.data,
      // unique_id: request.data.unique_id,
      // },
      // });
      // },
      // );
      await postService
        .sendPost({
          text: resendPostScenario.post!.text!,
          groupId: resendPostScenario.team._id,
        })
        .catch();
      await postService.reSendPost(sendFailedPost.id);
      const result2 = await postService.getPostsByGroupId({
        groupId: sendFailedTeamId,
      });

      expect(result2.posts.length).toEqual(1);
      expect(result2.posts[0].text).toEqual(sendFailedPost.text);
      expect(result2.posts[0].id > 0).toBeTruthy();
    });
  });
});
