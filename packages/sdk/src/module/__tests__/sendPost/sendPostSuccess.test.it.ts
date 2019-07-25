/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:25:48
 * Copyright © RingCentral. All rights reserved.
 */
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { itForSdk } from 'shield/sdk';
import { PostService } from 'sdk/module/post';
import { createSendPostScenario } from './data/sendPost.scenario';

itForSdk('Send post test', context => {
  let postService: PostService;
  const { helper, sdk, userContext, template } = context;
  const sendPostScenario = createSendPostScenario(context);
  const { post, team } = sendPostScenario;
  beforeAll(async () => {
    await sdk.setup();
    postService = ServiceLoader.getInstance(ServiceConfig.POST_SERVICE);
  });

  describe('PostService', () => {
    it('send post 1: success', async () => {
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
    // let sendFailedPost: Post;
    // it('send post 2: failed', async () => {
    //   helper.mockApi(IGlipPostPost, { status: 400 });
    //   await expect(
    //     postService.sendPost({
    //       text: 'test post 2',
    //       groupId: team1._id,
    //     }),
    //   ).rejects.not.toBeUndefined();
    //   const result = await postService.getPostsByGroupId({
    //     groupId: team1._id,
    //   });
    //   sendFailedPost = result.posts[1];
    //   expect(result.posts.length).toEqual(2);
    //   expect(sendFailedPost.id < 0).toBeTruthy();
    // });
    // it('received a post', async () => {
    //   await helper.socketServer.emitPacket(
    //     require('./data/RECEIVE_POST.SOCKET.json'),
    //   );
    //   await wait();
    //   const result = await postService.getPostsByGroupId({
    //     groupId: 16386,
    //   });
    //   expect(
    //     result.posts.find(item => item.text === 'hello'),
    //   ).not.toBeUndefined();
    // });
    // it('resend post successfully', async () => {
    //   helper.mockResponse(
    //     readJson<IGlipPostPost>(require('./data/SEND_POST.SUCCESS.json')),
    //     data => {
    //       data.response.data.group_id = team1._id;
    //       data.response.data.text = 'test post 2';
    //       data.response.data._id = helper.glipDataHelper().post.factory.build()._id;
    //     },
    //     (request, requestResponse) => {
    //       return createResponse({
    //         ...requestResponse.response,
    //         data: {...requestResponse.response.data, unique_id: request.data.unique_id}
    //       })
    //     }
    //   );
    //   await postService.reSendPost(sendFailedPost.id);
    //   const result = await postService.getPostsByGroupId({
    //     groupId: team1._id,
    //   });

    //   expect(result.posts.length).toEqual(2);
    //   expect(result.posts[1].text).toEqual(sendFailedPost.text);
    //   expect(result.posts[1].id > 0).toBeTruthy();
    // });
  });
});
