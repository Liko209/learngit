/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:25:48
 * Copyright © RingCentral. All rights reserved.
 */
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { itForSdk } from 'shield/sdk';
import { PostService } from 'sdk/module/post';
import { createSendPostFailScenario } from './data/sendPostFail.scenario';

itForSdk('Send post test', context => {
  let postService: PostService;
  const { helper, sdk, userContext, template } = context;
  const sendPostFailScenario = createSendPostFailScenario(context);
  beforeAll(async () => {
    await sdk.setup();
    postService = ServiceLoader.getInstance(ServiceConfig.POST_SERVICE);
  });

  describe('SendPost', () => {
    it('send post 2: failed', async () => {
      await expect(
        postService.sendPost({
          text: 'test post 2',
          groupId: sendPostFailScenario.team._id,
        }),
      ).rejects.not.toBeUndefined();
      const result = await postService.getPostsByGroupId({
        groupId: sendPostFailScenario.team._id,
      });
      const sendFailedPost = result.posts[0];

      expect(result.posts.length).toEqual(1);
      expect(sendFailedPost.id < 0).toBeTruthy();
    });
  });
});
